import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, X, Loader2, Image as ImageIcon, Lock, ChevronLeft, ChevronRight, LayoutGrid, List, ArrowDownWideNarrow, ArrowUpWideNarrow, Calendar, User, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import heic2any from "heic2any";
import HeicImage from "@/components/HeicImage";

interface Photo {
  id: string;
  file_path: string;
  file_name: string;
  uploaded_by: string | null;
  caption: string | null;
  created_at: string;
  approved: boolean;
}

const PhotoGallery = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploaderName, setUploaderName] = useState("");
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadsEnabled, setUploadsEnabled] = useState(false);
  const [uploadEnabledFrom, setUploadEnabledFrom] = useState<Date | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();

  const sortedPhotos = useMemo(() => {
    const arr = [...photos];
    arr.sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortOrder === "newest" ? db - da : da - db;
    });
    return arr;
  }, [photos, sortOrder]);

  useEffect(() => {
    fetchPhotos();
    checkUploadStatus();
  }, []);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .eq("approved", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error("Error fetching photos:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkUploadStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("wedding_settings")
        .select("upload_enabled_from")
        .maybeSingle();

      if (error) throw error;
      
      if (data?.upload_enabled_from) {
        const enabledDate = new Date(data.upload_enabled_from);
        setUploadEnabledFrom(enabledDate);
        setUploadsEnabled(enabledDate <= new Date());
      }
    } catch (error) {
      console.error("Error checking upload status:", error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!uploadsEnabled) {
      toast({
        title: "Uppladdning ej tillgänglig",
        description: "Bilduppladdning öppnar vid bröllopet.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFiles(Array.from(files));
    // Reset input so the same files can be re-selected
    event.target.value = "";
  };

  const convertHeicToJpeg = async (file: File): Promise<File> => {
    const heicExtensions = /\.(heic|heif)$/i;
    if (!heicExtensions.test(file.name) && !file.type.includes("heic") && !file.type.includes("heif")) {
      return file;
    }
    const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 }) as Blob;
    const newName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
    return new File([blob], newName, { type: "image/jpeg" });
  };

  const handleConfirmUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);

    try {
      for (let file of selectedFiles) {
        // Convert HEIC/HEIF to JPEG
        file = await convertHeicToJpeg(file);

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `gallery/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("wedding-photos")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase.from("photos").insert({
          file_path: filePath,
          file_name: file.name,
          uploaded_by: uploaderName || "Anonym gäst",
        });

        if (dbError) throw dbError;
      }

      toast({
        title: "Uppladdning klar!",
        description: "Tack! Dina bilder väntar på godkännande av brudparet.",
      });

      setSelectedFiles([]);
    } catch (error) {
      console.error("Error uploading:", error);
      toast({
        title: "Något gick fel",
        description: "Kunde inte ladda upp bilden. Försök igen.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setSelectedFiles([]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getImageUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from("wedding-photos")
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const isVideo = (fileName: string) =>
    /\.(mp4|mov|webm|m4v|3gp|3gpp|quicktime)$/i.test(fileName);

  const handleDownload = async (photo: Photo, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const url = getImageUrl(photo.file_path);
      const res = await fetch(url);
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
      toast({ title: "Nedladdning startad", description: photo.file_name });
    } catch (err) {
      console.error("Download error:", err);
      toast({ title: "Kunde inte ladda ner", variant: "destructive" });
    }
  };

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-soft-pink/20 via-blush/10 to-background relative overflow-hidden" id="gallery">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-24 sm:h-32 bg-gradient-to-b from-dusty-rose/10 to-transparent" />
        <div className="absolute top-10 sm:top-20 left-4 sm:left-10 w-40 sm:w-64 h-40 sm:h-64 rounded-full bg-blush/20 blur-3xl" />
        <div className="absolute bottom-10 sm:bottom-20 right-4 sm:right-10 w-48 sm:w-80 h-48 sm:h-80 rounded-full bg-soft-pink/20 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-32 sm:w-48 h-32 sm:h-48 rounded-full bg-dusty-rose/15 blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 sm:mb-16"
        >
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, type: "spring" }}
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-6 sm:mb-8 rounded-full bg-gradient-to-br from-blush via-soft-pink to-dusty-rose/50 flex items-center justify-center shadow-lg"
          >
            <Camera className="w-7 h-7 sm:w-9 sm:h-9 text-foreground/80" />
          </motion.div>
          <h2 className="text-3xl sm:text-4xl md:text-6xl font-serif font-light text-foreground mb-3 sm:mb-4 tracking-wide">
            Fotogalleri
          </h2>
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="w-12 sm:w-16 h-px bg-gradient-to-r from-transparent to-dusty-rose/60" />
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-dusty-rose/60" />
            <div className="w-12 sm:w-16 h-px bg-gradient-to-l from-transparent to-dusty-rose/60" />
          </div>
          <p className="text-muted-foreground font-body max-w-lg mx-auto text-lg leading-relaxed">
            Dela dina bilder från bröllopet med oss
          </p>
        </motion.div>

        {/* Upload section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-md mx-auto mb-16"
        >
          <div className="bg-gradient-to-br from-card via-soft-pink/20 to-blush/30 p-6 rounded-2xl shadow-card border border-blush/30 backdrop-blur-sm">
            {uploadsEnabled ? (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-body text-muted-foreground mb-2">
                    Ditt namn (valfritt)
                  </label>
                  <Input
                    type="text"
                    placeholder="Ange ditt namn"
                    value={uploaderName}
                    onChange={(e) => setUploaderName(e.target.value)}
                    className="font-body"
                  />
                </div>

                <label className="relative block">
                  <input
                    type="file"
                    accept="image/*,video/*,.heic,.heif"
                    multiple
                    onChange={handleFileSelect}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <Button
                    className="w-full font-body"
                    disabled={uploading}
                    asChild
                  >
                    <span>
                      <Camera className="w-4 h-4 mr-2" />
                      Välj bilder & videos
                    </span>
                  </Button>
                </label>

                {/* Preview selected files */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm font-body text-foreground font-medium">
                      {selectedFiles.length} {selectedFiles.length === 1 ? "fil vald" : "filer valda"}
                    </p>
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                          {file.type.startsWith("video/") ? (
                            <div className="w-full h-full flex items-center justify-center bg-muted">
                              <span className="text-xs text-muted-foreground font-body text-center px-1 truncate">{file.name}</span>
                            </div>
                          ) : (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <button
                            onClick={() => removeSelectedFile(index)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1 font-body"
                        onClick={handleConfirmUpload}
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
                            Ladda upp {selectedFiles.length} {selectedFiles.length === 1 ? "fil" : "filer"}
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelUpload}
                        disabled={uploading}
                        className="font-body"
                      >
                        Avbryt
                      </Button>
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground font-body mt-3 text-center">
                  Bilder och videos granskas av brudparet innan de visas i galleriet
                </p>
              </>
            ) : (
              <div className="text-center py-4">
                <Lock className="w-8 h-8 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground font-body">
                  Bilduppladdning öppnar vid bröllopet
                </p>
                {uploadEnabledFrom && (
                  <p className="text-sm text-primary font-body mt-2 font-semibold">
                    {uploadEnabledFrom.toLocaleDateString("sv-SE", {
                      day: "numeric", 
                      month: "long", 
                      year: "numeric" 
                    })}
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Photo grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-dusty-rose" />
          </div>
        ) : photos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blush/30 to-soft-pink/20 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground font-body text-lg">
              Inga bilder uppladdade ännu
            </p>
            <p className="text-muted-foreground/60 font-body text-sm mt-2">
              Var först med att dela dina minnen!
            </p>
          </motion.div>
        ) : (
          <>
            {/* Toolbar: sort + view mode */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6 sm:mb-8 max-w-5xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blush/40 to-soft-pink/40 border border-blush/40 shadow-sm">
                <ImageIcon className="w-4 h-4 text-dusty-rose" />
                <p className="text-sm text-foreground font-body">
                  <span className="font-serif text-base text-dusty-rose font-medium">{sortedPhotos.length}</span> {sortedPhotos.length === 1 ? "minne delat" : "minnen delade"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* Sort toggle */}
                <div className="inline-flex rounded-full border border-blush/40 bg-card/60 backdrop-blur-sm p-1 shadow-sm">
                  <button
                    onClick={() => setSortOrder("newest")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body transition-all ${
                      sortOrder === "newest"
                        ? "bg-gradient-to-r from-dusty-rose/80 to-blush text-white shadow"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <ArrowDownWideNarrow className="w-3.5 h-3.5" />
                    Nyast
                  </button>
                  <button
                    onClick={() => setSortOrder("oldest")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body transition-all ${
                      sortOrder === "oldest"
                        ? "bg-gradient-to-r from-dusty-rose/80 to-blush text-white shadow"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <ArrowUpWideNarrow className="w-3.5 h-3.5" />
                    Äldst
                  </button>
                </div>
                {/* View toggle */}
                <div className="inline-flex rounded-full border border-blush/40 bg-card/60 backdrop-blur-sm p-1 shadow-sm">
                  <button
                    onClick={() => setViewMode("grid")}
                    aria-label="Rutnät"
                    className={`p-1.5 rounded-full transition-all ${
                      viewMode === "grid"
                        ? "bg-gradient-to-r from-dusty-rose/80 to-blush text-white shadow"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    aria-label="Lista"
                    className={`p-1.5 rounded-full transition-all ${
                      viewMode === "list"
                        ? "bg-gradient-to-r from-dusty-rose/80 to-blush text-white shadow"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>

            {viewMode === "grid" ? (
              <div className="columns-2 md:columns-3 lg:columns-4 gap-2 sm:gap-4 space-y-2 sm:space-y-4">
                {sortedPhotos.map((photo, index) => (
                  <motion.div
                    key={photo.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: Math.min(index * 0.03, 0.3) }}
                    className="break-inside-avoid cursor-pointer group"
                    onClick={() => {
                      setSelectedPhotoIndex(index);
                      supabase.rpc('increment_view_count', { photo_id: photo.id }).then();
                    }}
                  >
                    <div className="relative overflow-hidden rounded-2xl shadow-soft border border-blush/30 group-hover:border-dusty-rose/50 transition-all duration-500 group-hover:shadow-lg group-hover:-translate-y-1">
                      {isVideo(photo.file_name) ? (
                        <>
                          <video
                            src={getImageUrl(photo.file_path)}
                            className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                            muted
                            playsInline
                            preload="metadata"
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                              <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            </div>
                          </div>
                        </>
                      ) : (
                        <HeicImage
                          src={getImageUrl(photo.file_path)}
                          fileName={photo.file_name}
                          alt={photo.file_name}
                          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                          loading="lazy"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-dusty-rose/40 via-transparent to-soft-pink/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute inset-0 ring-2 ring-inset ring-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
                {sortedPhotos.map((photo, index) => {
                  const date = new Date(photo.created_at);
                  const dateStr = date.toLocaleDateString("sv-SE", { day: "numeric", month: "long", year: "numeric" });
                  const timeStr = date.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
                  return (
                    <motion.article
                      key={photo.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.2) }}
                      className="group bg-gradient-to-br from-card via-soft-pink/10 to-blush/20 rounded-3xl border border-blush/30 shadow-card hover:shadow-lg overflow-hidden transition-all duration-500 hover:-translate-y-0.5 cursor-pointer"
                      onClick={() => {
                        setSelectedPhotoIndex(index);
                        supabase.rpc('increment_view_count', { photo_id: photo.id }).then();
                      }}
                    >
                      <div className="flex items-center justify-between px-5 sm:px-6 py-3 border-b border-blush/20">
                        <div className="flex items-center gap-2 text-sm text-foreground/80 font-body">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blush to-dusty-rose/60 flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-medium">{photo.uploaded_by || "Anonym gäst"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-body">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{dateStr}</span>
                          <span className="opacity-50">·</span>
                          <span>{timeStr}</span>
                        </div>
                      </div>
                      <div className="relative bg-black/5 overflow-hidden">
                        {isVideo(photo.file_name) ? (
                          <>
                            <video
                              src={getImageUrl(photo.file_path)}
                              className="w-full max-h-[80vh] object-contain transition-transform duration-700 group-hover:scale-[1.01]"
                              muted
                              playsInline
                              preload="metadata"
                            />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center shadow-lg">
                                <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                              </div>
                            </div>
                          </>
                        ) : (
                          <HeicImage
                            src={getImageUrl(photo.file_path)}
                            fileName={photo.file_name}
                            alt={photo.file_name}
                            className="w-full max-h-[80vh] object-contain transition-transform duration-700 group-hover:scale-[1.01]"
                            loading="lazy"
                          />
                        )}
                      </div>
                      {photo.caption && (
                        <div className="px-5 sm:px-6 py-3 text-sm text-foreground/80 font-body italic">
                          "{photo.caption}"
                        </div>
                      )}
                    </motion.article>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Lightbox with navigation */}
        <AnimatePresence>
          {selectedPhotoIndex !== null && sortedPhotos[selectedPhotoIndex] && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
              onClick={() => setSelectedPhotoIndex(null)}
            >
              {/* Close button */}
              <button
                className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
                onClick={() => setSelectedPhotoIndex(null)}
              >
                <X className="w-8 h-8" />
              </button>

              {/* Previous button */}
              {selectedPhotoIndex > 0 && (
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newIndex = selectedPhotoIndex - 1;
                    setSelectedPhotoIndex(newIndex);
                    supabase.rpc('increment_view_count', { photo_id: sortedPhotos[newIndex].id }).then();
                  }}
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
              )}

              {/* Next button */}
              {selectedPhotoIndex < sortedPhotos.length - 1 && (
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    const newIndex = selectedPhotoIndex + 1;
                    setSelectedPhotoIndex(newIndex);
                    supabase.rpc('increment_view_count', { photo_id: sortedPhotos[newIndex].id }).then();
                  }}
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              )}

              {/* Media */}
              {isVideo(sortedPhotos[selectedPhotoIndex].file_name) ? (
                <motion.video
                  key={sortedPhotos[selectedPhotoIndex].id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  src={getImageUrl(sortedPhotos[selectedPhotoIndex].file_path)}
                  controls
                  autoPlay
                  playsInline
                  className="max-w-full max-h-[90vh] object-contain rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <motion.div
                  key={sortedPhotos[selectedPhotoIndex].id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <HeicImage
                    src={getImageUrl(sortedPhotos[selectedPhotoIndex].file_path)}
                    fileName={sortedPhotos[selectedPhotoIndex].file_name}
                    alt={sortedPhotos[selectedPhotoIndex].file_name}
                    className="max-w-full max-h-[90vh] object-contain rounded-lg"
                  />
                </motion.div>
              )}

              {/* Photo counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 font-body text-sm">
                {selectedPhotoIndex + 1} / {sortedPhotos.length}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default PhotoGallery;