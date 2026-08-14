import { useState, useEffect, useMemo, useCallback } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import HeicImage from "@/components/HeicImage";

interface Photo {
  id: string;
  file_path: string;
  file_name: string;
  caption: string | null;
  created_at: string;
  taken_at: string | null;
}

const CATEGORY = "photographer";
const CONCURRENCY = 4;
const PAGE_SIZE = 1000;

const Photographer = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, failed: 0 });

  const fetchPhotos = useCallback(async () => {
    try {
      const all: Photo[] = [];
      for (let page = 0; ; page++) {
        const { data, error } = await supabase
          .from("photos")
          .select("id,file_path,file_name,caption,created_at,taken_at")
          .eq("approved", true)
          .eq("category", CATEGORY)
          .order("taken_at", { ascending: true, nullsFirst: false })
          .order("created_at", { ascending: true })
          .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);
        if (error) throw error;
        all.push(...((data as Photo[]) || []));
        if (!data || data.length < PAGE_SIZE) break;
      }
      setPhotos(all);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  useEffect(() => {
    const hash = location.hash.replace("#", "");
    if (!hash) return;
    const t = window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);
    return () => window.clearTimeout(t);
  }, [location.hash, isAdmin]);

  useEffect(() => {
    if (selectedIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIndex(null);
      if (e.key === "ArrowLeft") setSelectedIndex((i) => (i && i > 0 ? i - 1 : i));
      if (e.key === "ArrowRight")
        setSelectedIndex((i) => (i !== null && i < photos.length - 1 ? i + 1 : i));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedIndex, photos.length]);

  const getUrl = (p: string) =>
    supabase.storage.from("wedding-photos").getPublicUrl(p).data.publicUrl;

  const isVideo = (n: string) => /\.(mp4|mov|webm|m4v|3gp|3gpp|quicktime)$/i.test(n);

  const uploadOne = async (file: File) => {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `photographer/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("wedding-photos")
      .upload(path, file, { cacheControl: "31536000", upsert: false });
    if (upErr) throw upErr;
    const { error: dbErr } = await supabase.from("photos").insert({
      file_path: path,
      file_name: file.name,
      uploaded_by: "Fotografen",
      category: CATEGORY,
      approved: true,
      taken_at: file.lastModified ? new Date(file.lastModified).toISOString() : null,
    });
    if (dbErr) throw dbErr;
  };

  const handleFiles = async (files: File[]) => {
    if (!files.length) return;
    setUploading(true);
    setProgress({ done: 0, total: files.length, failed: 0 });

    let cursor = 0;
    let done = 0;
    let failed = 0;

    const worker = async () => {
      while (cursor < files.length) {
        const file = files[cursor++];
        try {
          await uploadOne(file);
        } catch (e) {
          console.error("Upload failed", file.name, e);
          failed++;
        }
        done++;
        setProgress({ done, total: files.length, failed });
      }
    };

    await Promise.all(Array.from({ length: CONCURRENCY }, worker));

    toast({
      title: failed ? "Uppladdning klar (med fel)" : "Uppladdat!",
      description: `${done - failed} av ${files.length} filer tillagda${
        failed ? `, ${failed} misslyckades` : ""
      }`,
      variant: failed ? "destructive" : undefined,
    });
    setUploading(false);
    fetchPhotos();
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

  const pct = progress.total
    ? Math.round((progress.done / progress.total) * 100)
    : 0;

  const current = selectedIndex !== null ? photos[selectedIndex] : null;

  const grouped = useMemo(() => photos, [photos]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blush/10 via-background to-sage/10">
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-md border-b border-blush/30">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground font-body transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Tillbaka till bröllopet
          </Link>
          <span className="font-serif text-lg text-foreground">A &amp; R</span>
        </div>
      </header>

      <section className="py-12 sm:py-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-64 h-64 rounded-full bg-blush/20 blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-72 h-72 rounded-full bg-sage/20 blur-3xl" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blush/50 via-dusty-rose/40 to-sage/40 flex items-center justify-center shadow-lg"
          >
            <Camera className="w-9 h-9 sm:w-11 sm:h-11 text-foreground/80" />
          </motion.div>
          <p className="text-xs sm:text-sm tracking-[0.3em] uppercase text-muted-foreground mb-3 font-body">
            Andreas &amp; Rebecka
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-light text-foreground mb-4">
            Fotografens bilder
          </h1>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-blush/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-blush/60" />
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-blush/60" />
          </div>
          <p className="text-muted-foreground font-body max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
            Alla proffsbilder från vår dag — bläddra och ladda ner de du vill spara.
          </p>

          {!loading && photos.length > 0 && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/70 border border-blush/30 font-body text-sm text-muted-foreground">
              <ImageIcon className="w-4 h-4" />
              {photos.length} bilder
            </div>
          )}

          {isAdmin && (
            <div id="photographer-upload" className="mt-8 max-w-lg mx-auto scroll-mt-24">
              <div className="bg-card/80 border border-blush/30 rounded-2xl p-6 shadow-card backdrop-blur-sm">
                <p className="font-body text-sm text-muted-foreground mb-4">
                  Endast admin: ladda upp fotografens bilder (stöder 600+ filer)
                </p>
                <label className="relative block">
                  <input
                    type="file"
                    accept="image/*,video/*,.heic,.heif"
                    multiple
                    disabled={uploading}
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      e.target.value = "";
                      handleFiles(files);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <Button className="w-full font-body" disabled={uploading} asChild>
                    <span>
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Laddar upp… {pct}%
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Välj filer att ladda upp
                        </>
                      )}
                    </span>
                  </Button>
                </label>

                {uploading && (
                  <div className="mt-4">
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-sage transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs font-body text-muted-foreground">
                      {progress.done} / {progress.total} klara
                      {progress.failed ? ` · ${progress.failed} misslyckades` : ""}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 pb-20">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-sage" />
          </div>
        ) : photos.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16 rounded-2xl border border-dashed border-blush/40 bg-blush/5">
            <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground font-body italic">
              Fotografens bilder kommer snart
            </p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto columns-2 md:columns-3 lg:columns-4 gap-2 sm:gap-4 space-y-2 sm:space-y-4">
            {grouped.map((photo, i) => (
              <div
                key={photo.id}
                className="break-inside-avoid cursor-pointer group"
                onClick={() => {
                  setSelectedIndex(i);
                  supabase.rpc("increment_view_count", { photo_id: photo.id }).then();
                }}
              >
                <div className="relative overflow-hidden rounded-2xl shadow-soft border border-blush/20 group-hover:border-blush/50 transition-all duration-500 group-hover:shadow-lg group-hover:-translate-y-1">
                  {isVideo(photo.file_name) ? (
                    <>
                      <video
                        src={getUrl(photo.file_path)}
                        className="w-full h-auto object-cover"
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
                      alt={photo.caption || photo.file_name}
                      className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <AnimatePresence>
        {current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedIndex(null)}
          >
            <div
              className="absolute top-4 right-4 z-10 flex items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="flex items-center gap-1.5 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-body transition-colors"
                onClick={(e) => handleDownload(current, e)}
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

            {selectedIndex! > 0 && (
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(selectedIndex! - 1);
                }}
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}
            {selectedIndex! < photos.length - 1 && (
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(selectedIndex! + 1);
                }}
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}

            {isVideo(current.file_name) ? (
              <video
                key={current.id}
                src={getUrl(current.file_path)}
                controls
                autoPlay
                playsInline
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div onClick={(e) => e.stopPropagation()}>
                <HeicImage
                  src={getUrl(current.file_path)}
                  fileName={current.file_name}
                  alt={current.caption || current.file_name}
                  className="max-w-full max-h-[90vh] object-contain rounded-lg"
                />
              </div>
            )}

            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 font-body text-sm">
              {selectedIndex! + 1} / {photos.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Photographer;
