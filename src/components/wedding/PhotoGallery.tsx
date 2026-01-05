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
    <section className="py-24 bg-gradient-to-b from-soft-pink/30 via-blush/20 to-background relative overflow-hidden" id="gallery">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-blush/30 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-dusty-rose/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-soft-pink/20 blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-blush to-dusty-rose/50 flex items-center justify-center"
          >
            <Camera className="w-8 h-8 text-foreground/70" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-serif font-light text-foreground mb-4">
            Fotogalleri
          </h2>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-dusty-rose/60 to-transparent mx-auto mb-6" />
          <p className="text-muted-foreground font-body max-w-xl mx-auto">
            Dela dina bilder från festen! Vi samlar alla minnen här så att vi kan uppleva dagen igen.
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
                    accept="image/*"
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
                          Ladda upp bilder
                        </>
                      )}
                    </span>
                  </Button>
                </label>
                <p className="text-xs text-muted-foreground font-body mt-3 text-center">
                  Bilder granskas av brudparet innan de visas i galleriet
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
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : photos.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <ImageIcon className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground font-body">
              Inga bilder uppladdade ännu. Var först med att dela!
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="aspect-square cursor-pointer group"
                onClick={() => setSelectedPhotoIndex(index)}
              >
                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-card border-2 border-blush/20 group-hover:border-dusty-rose/40 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                  <img
                    src={getImageUrl(photo.file_path)}
                    alt={photo.file_name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dusty-rose/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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