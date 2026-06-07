import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  Loader2,
  Image as ImageIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
  Plane,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import heic2any from "heic2any";
import exifr from "exifr";
import HeicImage from "@/components/HeicImage";

interface Photo {
  id: string;
  file_path: string;
  file_name: string;
  uploaded_by: string | null;
  caption: string | null;
  created_at: string;
  taken_at: string | null;
}

const Honeymoon = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, []);

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (!hash) return;

    const timeout = window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [location.hash, isAdmin]);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .eq("approved", true)
        .eq("category", "honeymoon")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPhotos(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const photoDate = (p: Photo) => p.taken_at ?? p.created_at;

  const sorted = useMemo(
    () =>
      [...photos].sort(
        (a, b) =>
          new Date(photoDate(a)).getTime() - new Date(photoDate(b)).getTime()
      ),
    [photos]
  );

  // Honeymoon dag 1 startar 5 juni 2026. Natt/tidig morgon (innan kl 05) räknas
  // till föregående dag eftersom vi inte gått och lagt oss än.
  const HONEYMOON_START = new Date("2026-06-05T00:00:00+02:00");
  const NIGHT_CUTOFF_HOURS = 5;

  const getDayNumber = (iso: string) => {
    const d = new Date(iso);
    const adjusted = new Date(d.getTime() - NIGHT_CUTOFF_HOURS * 3600 * 1000);
    const start = new Date(
      HONEYMOON_START.getFullYear(),
      HONEYMOON_START.getMonth(),
      HONEYMOON_START.getDate()
    );
    const day = new Date(
      adjusted.getFullYear(),
      adjusted.getMonth(),
      adjusted.getDate()
    );
    const diff = Math.floor(
      (day.getTime() - start.getTime()) / (24 * 3600 * 1000)
    );
    return diff + 1;
  };

  const currentDay = useMemo(() => {
    return Math.max(1, getDayNumber(new Date().toISOString()));
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<number, Photo[]>();
    sorted.forEach((p) => {
      const day = getDayNumber(photoDate(p));
      if (day < 1) return;
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(p);
    });
    const maxDay = Math.max(
      currentDay,
      ...Array.from(map.keys()),
      1
    );
    const all: Array<[number, Photo[]]> = [];
    for (let d = 1; d <= maxDay; d++) {
      all.push([d, map.get(d) ?? []]);
    }
    return all;
  }, [sorted, currentDay]);


  const dayDate = (day: number) => {
    const d = new Date(HONEYMOON_START);
    d.setDate(d.getDate() + (day - 1));
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  // Platt lista i visningsordning (för lightbox-navigering)
  const flatPhotos = useMemo(
    () => grouped.flatMap(([, ps]) => ps),
    [grouped]
  );

  const getUrl = (p: string) =>
    supabase.storage.from("wedding-photos").getPublicUrl(p).data.publicUrl;

  const isVideo = (n: string) =>
    /\.(mp4|mov|webm|m4v|3gp|3gpp|quicktime)$/i.test(n);

  const convertHeic = async (file: File): Promise<File> => {
    if (!/\.(heic|heif)$/i.test(file.name) && !file.type.includes("heic"))
      return file;
    const blob = (await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.85,
    })) as Blob;
    return new File([blob], file.name.replace(/\.(heic|heif)$/i, ".jpg"), {
      type: "image/jpeg",
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setUploading(true);
    try {
      for (let file of selectedFiles) {
        file = await convertHeic(file);
        const ext = file.name.split(".").pop();
        const path = `honeymoon/${Date.now()}-${Math.random()
          .toString(36)
          .substring(7)}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("wedding-photos")
          .upload(path, file);
        if (upErr) throw upErr;
        const { error: dbErr } = await supabase.from("photos").insert({
          file_path: path,
          file_name: file.name,
          uploaded_by: "Brudparet",
          caption: caption || null,
          category: "honeymoon",
          approved: true,
        });
        if (dbErr) throw dbErr;
      }
      toast({
        title: "Uppladdat!",
        description: `${selectedFiles.length} fil(er) tillagda i bröllopsresan`,
      });
      setSelectedFiles([]);
      setCaption("");
      fetchPhotos();
    } catch (e) {
      console.error(e);
      toast({ title: "Något gick fel", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (photo: Photo, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(getUrl(photo.file_path));
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = photo.file_name || "bild";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
      supabase.rpc("increment_download_count", { photo_id: photo.id }).then();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage/10 via-background to-blush/10">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-blush/30">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-body transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Tillbaka till bröllopet
          </Link>
          <span className="font-serif text-lg text-foreground">A & R</span>
        </div>
      </header>

      {/* Hero */}
      <section className="py-12 sm:py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-64 h-64 rounded-full bg-sage/20 blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-72 h-72 rounded-full bg-blush/20 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-sage/40 via-blush/50 to-dusty-rose/40 flex items-center justify-center shadow-lg"
          >
            <Plane className="w-9 h-9 sm:w-11 sm:h-11 text-foreground/80" />
          </motion.div>
          <p className="text-xs sm:text-sm tracking-[0.3em] uppercase text-muted-foreground mb-3 font-body">
            Andreas & Rebecka
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-light text-foreground mb-4">
            Bröllopsresan
          </h1>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-sage/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-sage/60" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-sage/60" />
          </div>
          <p className="text-muted-foreground font-body max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
            En liten samling minnen från vår resa som nygifta.
          </p>

          {isAdmin && (
            <div className="mt-8 flex justify-center">
              <Button asChild size="lg" className="min-h-14 w-full max-w-sm px-8 font-body text-base shadow-soft">
                <a href="#honeymoon-upload">
                  <Upload className="w-5 h-5" />
                  Ladda upp till bröllopsresan
                </a>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Admin upload */}
      {isAdmin && (
        <section id="honeymoon-upload" className="container mx-auto px-4 sm:px-6 mb-12 scroll-mt-24">
          <div className="max-w-md mx-auto bg-gradient-to-br from-card via-soft-pink/20 to-sage/15 p-6 rounded-2xl shadow-card border border-blush/30">
            <p className="text-sm font-body text-foreground/80 mb-3 font-medium">
              Ladda upp bilder från bröllopsresan
            </p>
            <Input
              placeholder="Bildtext (valfri)"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="font-body mb-3"
            />
            <label className="relative block">
              <input
                type="file"
                accept="image/*,video/*,.heic,.heif"
                multiple
                onChange={(e) => {
                  const f = e.target.files;
                  if (f) setSelectedFiles(Array.from(f));
                  e.target.value = "";
                }}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button className="w-full font-body" disabled={uploading} asChild>
                <span>
                  <Camera className="w-4 h-4 mr-2" />
                  Välj filer
                </span>
              </Button>
            </label>
            {selectedFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-muted-foreground font-body">
                  {selectedFiles.length} fil(er) valda
                </p>
                <Button
                  className="w-full font-body"
                  onClick={handleUpload}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Laddar upp...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Ladda upp
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Gallery */}
      <section className="container mx-auto px-4 sm:px-6 pb-20">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-sage" />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-12">
            {grouped.map(([day, dayPhotos]) => {
              const startOffset = dayPhotos.length
                ? flatPhotos.findIndex((p) => p.id === dayPhotos[0].id)
                : 0;
              return (

                <div key={day}>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-sage/40 to-sage/40" />
                    <div className="text-center">
                      <h2 className="font-serif text-2xl sm:text-3xl text-foreground">
                        Dag {day}
                      </h2>
                      <p className="text-xs sm:text-sm tracking-[0.2em] uppercase text-muted-foreground font-body mt-1">
                        {dayDate(day)}
                      </p>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent via-sage/40 to-sage/40" />
                  </div>
                  {dayPhotos.length === 0 ? (
                    <div className="text-center py-8 rounded-2xl border border-dashed border-sage/30 bg-sage/5">
                      <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground/70 font-body italic">
                        Inga bilder ännu — kom tillbaka snart
                      </p>
                    </div>
                  ) : (
                  <div className="columns-2 md:columns-3 lg:columns-4 gap-2 sm:gap-4 space-y-2 sm:space-y-4">

                    {dayPhotos.map((photo, i) => {
                      const flatIndex = startOffset + i;
                      return (
                        <motion.div
                          key={photo.id}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: Math.min(i * 0.03, 0.3) }}
                          className="break-inside-avoid cursor-pointer group"
                          onClick={() => {
                            setSelectedIndex(flatIndex);
                            supabase.rpc("increment_view_count", { photo_id: photo.id }).then();
                          }}
                        >
                          <div className="relative overflow-hidden rounded-2xl shadow-soft border border-sage/20 group-hover:border-sage/50 transition-all duration-500 group-hover:shadow-lg group-hover:-translate-y-1">
                            {isVideo(photo.file_name) ? (
                              <>
                                <video
                                  src={getUrl(photo.file_path)}
                                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                  muted
                                  playsInline
                                  preload="metadata"
                                />
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                  <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  </div>
                                </div>
                              </>
                            ) : (
                              <HeicImage
                                src={getUrl(photo.file_path)}
                                fileName={photo.file_name}
                                alt={photo.file_name}
                                className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                loading="lazy"
                              />
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </section>


      {/* Lightbox */}
      <AnimatePresence>
        {selectedIndex !== null && flatPhotos[selectedIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedIndex(null)}
          >
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                className="flex items-center gap-1.5 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-body transition-colors"
                onClick={(e) => handleDownload(flatPhotos[selectedIndex!], e)}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Ladda ner</span>
              </button>
              <button
                className="text-white/80 hover:text-white p-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
                onClick={() => setSelectedIndex(null)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {selectedIndex > 0 && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(selectedIndex - 1);
                }}
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}
            {selectedIndex < flatPhotos.length - 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(selectedIndex + 1);
                }}
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}

            {isVideo(flatPhotos[selectedIndex].file_name) ? (
              <video
                key={flatPhotos[selectedIndex].id}
                src={getUrl(flatPhotos[selectedIndex].file_path)}
                controls
                autoPlay
                playsInline
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div onClick={(e) => e.stopPropagation()}>
                <HeicImage
                  src={getUrl(flatPhotos[selectedIndex].file_path)}
                  fileName={flatPhotos[selectedIndex].file_name}
                  alt={flatPhotos[selectedIndex].file_name}
                  className="max-w-full max-h-[90vh] object-contain rounded-lg"
                />
              </div>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 font-body text-sm">
              {selectedIndex + 1} / {flatPhotos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Honeymoon;
