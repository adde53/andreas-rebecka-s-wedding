import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, X, Loader2, Image as ImageIcon, Lock, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const { toast } = useToast();

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploading(true);

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `gallery/${fileName}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("wedding-photos")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Save to database
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

  const getImageUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from("wedding-photos")
      .getPublicUrl(filePath);
    return data.publicUrl;
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
          <p className="text-sm sm:text-lg text-muted-foreground font-body max-w-lg mx-auto leading-relaxed px-2">
            Dela dina minnen från festen med oss
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
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <Button
                    className="w-full font-body"
                    disabled={uploading}
                    asChild
                  >
                    <span>
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Laddar upp...
                        </>
                      ) : (
                        <>
                          <Camera className="w-4 h-4 mr-2" />
                          Ladda upp bilder & videos
                        </>
                      )}
                    </span>
                  </Button>
                </label>
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
                  <p className="text-sm text-primary font-body mt-2">
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
          <div className="columns-2 md:columns-3 lg:columns-4 gap-2 sm:gap-4 space-y-2 sm:space-y-4">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.03 }}
                className="break-inside-avoid cursor-pointer group"
                onClick={() => setSelectedPhotoIndex(index)}
              >
                <div className="relative overflow-hidden rounded-2xl shadow-soft border border-blush/30 group-hover:border-dusty-rose/50 transition-all duration-500 group-hover:shadow-lg group-hover:-translate-y-1">
                  <img
                    src={getImageUrl(photo.file_path)}
                    alt={photo.file_name}
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dusty-rose/40 via-transparent to-soft-pink/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 ring-2 ring-inset ring-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Lightbox with navigation */}
        <AnimatePresence>
          {selectedPhotoIndex !== null && photos[selectedPhotoIndex] && (
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
                    setSelectedPhotoIndex(selectedPhotoIndex - 1);
                  }}
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
              )}

              {/* Next button */}
              {selectedPhotoIndex < photos.length - 1 && (
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white z-10 p-2 rounded-full bg-black/30 hover:bg-black/50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedPhotoIndex(selectedPhotoIndex + 1);
                  }}
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              )}

              {/* Image */}
              <motion.img
                key={photos[selectedPhotoIndex].id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2 }}
                src={getImageUrl(photos[selectedPhotoIndex].file_path)}
                alt={photos[selectedPhotoIndex].file_name}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />

              {/* Photo counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 font-body text-sm">
                {selectedPhotoIndex + 1} / {photos.length}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default PhotoGallery;