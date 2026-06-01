import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import JSZip from "jszip";
import { 
  Check, 
  X, 
  Trash2, 
  LogOut, 
  Loader2, 
  Calendar,
  Image as ImageIcon,
  Settings,
  Download,
  Eye,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Photo {
  id: string;
  file_path: string;
  file_name: string;
  uploaded_by: string | null;
  caption: string | null;
  created_at: string;
  approved: boolean;
  rejected: boolean;
}

interface WeddingSettings {
  id: string;
  upload_enabled_from: string | null;
  wedding_start_time: string | null;
  wedding_end_time: string | null;
}

const Admin = () => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [settings, setSettings] = useState<WeddingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadDate, setUploadDate] = useState<Date | undefined>();
  const [weddingStartDate, setWeddingStartDate] = useState<Date | undefined>();
  const [weddingEndDate, setWeddingEndDate] = useState<Date | undefined>();
  const [savingDate, setSavingDate] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [downloading, setDownloading] = useState(false);
  
  const { user, isAdmin, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (!user || !isAdmin) {
        navigate("/auth");
      } else {
        fetchData();
      }
    }
  }, [user, isAdmin, authLoading, navigate]);

  const fetchData = async () => {
    try {
      // Fetch photos
      const { data: photosData, error: photosError } = await supabase
        .from("photos")
        .select("*")
        .order("created_at", { ascending: false });

      if (photosError) throw photosError;
      setPhotos(photosData || []);

      // Fetch settings
      const { data: settingsData, error: settingsError } = await supabase
        .from("wedding_settings")
        .select("*")
        .maybeSingle();

      if (settingsError) throw settingsError;
      setSettings(settingsData);
      
      if (settingsData?.upload_enabled_from) {
        setUploadDate(new Date(settingsData.upload_enabled_from));
      }
      if (settingsData?.wedding_start_time) {
        setWeddingStartDate(new Date(settingsData.wedding_start_time));
      }
      if (settingsData?.wedding_end_time) {
        setWeddingEndDate(new Date(settingsData.wedding_end_time));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Fel",
        description: "Kunde inte hämta data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (photoId: string, approved: boolean) => {
    try {
      const { error } = await supabase
        .from("photos")
        .update({ approved, rejected: false })
        .eq("id", photoId);

      if (error) throw error;

      setPhotos(photos.map(p => 
        p.id === photoId ? { ...p, approved, rejected: false } : p
      ));

      toast({
        title: approved ? "Bild godkänd!" : "Bild flyttad till väntelistan",
        description: approved 
          ? "Bilden visas nu i galleriet" 
          : "Bilden är dold från galleriet",
      });
    } catch (error) {
      console.error("Error updating photo:", error);
      toast({
        title: "Fel",
        description: "Kunde inte uppdatera bilden",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (photoId: string) => {
    try {
      const { error } = await supabase
        .from("photos")
        .update({ approved: false, rejected: true })
        .eq("id", photoId);

      if (error) throw error;

      setPhotos(photos.map(p =>
        p.id === photoId ? { ...p, approved: false, rejected: true } : p
      ));

      toast({
        title: "Bild nekad",
        description: "Bilden flyttades till nekade bilder och kan godkännas senare",
      });
    } catch (error) {
      console.error("Error rejecting photo:", error);
      toast({
        title: "Fel",
        description: "Kunde inte neka bilden",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (photoId: string, filePath: string) => {
    if (!confirm("Är du säker på att du vill ta bort denna bild?")) return;

    try {
      // Delete from storage
      await supabase.storage
        .from("wedding-photos")
        .remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from("photos")
        .delete()
        .eq("id", photoId);

      if (error) throw error;

      setPhotos(photos.filter(p => p.id !== photoId));

      toast({
        title: "Bild borttagen",
        description: "Bilden har tagits bort permanent",
      });
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast({
        title: "Fel",
        description: "Kunde inte ta bort bilden",
        variant: "destructive",
      });
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    
    setSavingDate(true);
    
    try {
      const { error } = await supabase
        .from("wedding_settings")
        .update({ 
          upload_enabled_from: uploadDate ? uploadDate.toISOString() : null,
          wedding_start_time: weddingStartDate ? weddingStartDate.toISOString() : null,
          wedding_end_time: weddingEndDate ? weddingEndDate.toISOString() : null,
          updated_at: new Date().toISOString()
        })
        .eq("id", settings.id);

      if (error) throw error;

      toast({
        title: "Inställningar sparade!",
        description: "Alla inställningar har sparats",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Fel",
        description: "Kunde inte spara inställningarna",
        variant: "destructive",
      });
    } finally {
      setSavingDate(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getImageUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from("wedding-photos")
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleDownloadAll = async () => {
    setDownloading(true);
    try {
      const zip = new JSZip();
      const used = new Set<string>();
      for (const photo of photos) {
        const url = getImageUrl(photo.file_path);
        const response = await fetch(url);
        const blob = await response.blob();
        let name = photo.file_name;
        if (used.has(name)) {
          const dot = name.lastIndexOf(".");
          const base = dot > 0 ? name.slice(0, dot) : name;
          const ext = dot > 0 ? name.slice(dot) : "";
          name = `${base}-${photo.id.slice(0, 6)}${ext}`;
        }
        used.add(name);
        zip.file(name, blob);
      }
      const content = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(content);
      link.download = `brollopsbilder-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast({
        title: "Nedladdning klar!",
        description: `${photos.length} bilder paketerade i en ZIP-fil`,
      });
    } catch (error) {
      console.error("Error downloading photos:", error);
      toast({
        title: "Fel",
        description: "Kunde inte ladda ner bilderna",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };


  const handleDownloadSingle = async (photo: Photo) => {
    try {
      const url = getImageUrl(photo.file_path);
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = photo.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error downloading photo:", error);
      toast({
        title: "Fel",
        description: "Kunde inte ladda ner bilden",
        variant: "destructive",
      });
    }
  };

  const pendingPhotos = photos.filter(p => !p.approved && !p.rejected);
  const rejectedPhotos = photos.filter(p => p.rejected);
  const approvedPhotos = photos.filter(p => p.approved);

  // Ordered list used for prev/next navigation in preview: pending → rejected → approved
  const orderedPhotos = [...pendingPhotos, ...rejectedPhotos, ...approvedPhotos];
  const selectedIndex = selectedPhoto
    ? orderedPhotos.findIndex(p => p.id === selectedPhoto.id)
    : -1;

  const goToPhoto = useCallback((delta: number) => {
    if (selectedIndex < 0) return;
    const next = orderedPhotos[selectedIndex + delta];
    if (next) setSelectedPhoto(next);
  }, [selectedIndex, orderedPhotos]);

  useEffect(() => {
    if (!selectedPhoto) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPhoto(-1);
      else if (e.key === "ArrowRight") goToPhoto(1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedPhoto, goToPhoto]);

  // Keep selected photo in sync if its approval changes
  useEffect(() => {
    if (!selectedPhoto) return;
    const updated = photos.find(p => p.id === selectedPhoto.id);
    if (updated && updated.approved !== selectedPhoto.approved) {
      setSelectedPhoto(updated);
    }
  }, [photos, selectedPhoto]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-serif text-foreground">Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground font-body hidden sm:block">
              {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Logga ut
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs defaultValue="photos" className="space-y-6">
          <TabsList>
            <TabsTrigger value="photos" className="font-body">
              <ImageIcon className="w-4 h-4 mr-2" />
              Bilder
              {pendingPhotos.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {pendingPhotos.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="font-body">
              <Settings className="w-4 h-4 mr-2" />
              Inställningar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="photos" className="space-y-8">
            {/* Download all button */}
            {photos.length > 0 && (
              <div className="flex justify-end">
                <Button
                  onClick={handleDownloadAll}
                  disabled={downloading}
                  variant="outline"
                >
                  {downloading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Ladda ner alla ({photos.length})
                </Button>
              </div>
            )}

            {/* Pending photos */}
            <section>
              <h2 className="text-xl font-serif mb-4 text-foreground">
                Väntar på godkännande ({pendingPhotos.length})
              </h2>
              
              {pendingPhotos.length === 0 ? (
                <p className="text-muted-foreground font-body">
                  Inga bilder att granska
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {pendingPhotos.map((photo) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <div 
                        className="aspect-square rounded-lg overflow-hidden shadow-soft cursor-pointer"
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        <img
                          src={getImageUrl(photo.file_path)}
                          alt={photo.file_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedPhoto(photo)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleApprove(photo.id, true)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(photo.id, photo.file_path)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>

            {/* Approved photos */}
            <section>
              <h2 className="text-xl font-serif mb-4 text-foreground">
                Godkända bilder ({approvedPhotos.length})
              </h2>
              
              {approvedPhotos.length === 0 ? (
                <p className="text-muted-foreground font-body">
                  Inga godkända bilder ännu
                </p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {approvedPhotos.map((photo) => (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <div 
                        className="aspect-square rounded-lg overflow-hidden shadow-soft ring-2 ring-primary/20 cursor-pointer"
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        <img
                          src={getImageUrl(photo.file_path)}
                          alt={photo.file_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setSelectedPhoto(photo)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDownloadSingle(photo)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleApprove(photo.id, false)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(photo.id, photo.file_path)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </section>
          </TabsContent>

          <TabsContent value="settings">
            <div className="max-w-2xl space-y-6">
              {/* Wedding times */}
              <div className="bg-card p-6 rounded-xl shadow-soft border border-blush/20">
                <h2 className="text-xl font-serif mb-4 text-foreground">
                  Bröllopstider
                </h2>
                <p className="text-sm text-muted-foreground font-body mb-4">
                  Ange när bröllopet börjar och slutar.
                </p>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Wedding start time */}
                  <div className="space-y-4">
                    <h3 className="text-md font-body font-medium text-foreground">Starttid</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-body text-foreground">Datum</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !weddingStartDate && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {weddingStartDate ? (
                              format(weddingStartDate, "d MMMM yyyy", { locale: sv })
                            ) : (
                              "Välj datum"
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={weddingStartDate}
                            onSelect={(date) => {
                              if (date) {
                                const hours = weddingStartDate?.getHours() ?? 14;
                                const minutes = weddingStartDate?.getMinutes() ?? 0;
                                date.setHours(hours, minutes, 0, 0);
                              }
                              setWeddingStartDate(date);
                            }}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {weddingStartDate && (
                      <div className="space-y-2">
                        <label className="text-sm font-body text-foreground">Tid</label>
                        <div className="flex gap-2">
                          <select
                            value={weddingStartDate.getHours()}
                            onChange={(e) => {
                              const newDate = new Date(weddingStartDate);
                              newDate.setHours(parseInt(e.target.value));
                              setWeddingStartDate(newDate);
                            }}
                            className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-sm"
                          >
                            {Array.from({ length: 24 }, (_, i) => (
                              <option key={i} value={i}>
                                {i.toString().padStart(2, "0")}
                              </option>
                            ))}
                          </select>
                          <span className="flex items-center text-muted-foreground">:</span>
                          <select
                            value={weddingStartDate.getMinutes()}
                            onChange={(e) => {
                              const newDate = new Date(weddingStartDate);
                              newDate.setMinutes(parseInt(e.target.value));
                              setWeddingStartDate(newDate);
                            }}
                            className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-sm"
                          >
                            {Array.from({ length: 60 }, (_, i) => (
                              <option key={i} value={i}>
                                {i.toString().padStart(2, "0")}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {weddingStartDate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setWeddingStartDate(undefined)}
                      >
                        Rensa starttid
                      </Button>
                    )}
                  </div>

                  {/* Wedding end time */}
                  <div className="space-y-4">
                    <h3 className="text-md font-body font-medium text-foreground">Sluttid</h3>
                    <div className="space-y-2">
                      <label className="text-sm font-body text-foreground">Datum</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !weddingEndDate && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {weddingEndDate ? (
                              format(weddingEndDate, "d MMMM yyyy", { locale: sv })
                            ) : (
                              "Välj datum"
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={weddingEndDate}
                            onSelect={(date) => {
                              if (date) {
                                const hours = weddingEndDate?.getHours() ?? 23;
                                const minutes = weddingEndDate?.getMinutes() ?? 0;
                                date.setHours(hours, minutes, 0, 0);
                              }
                              setWeddingEndDate(date);
                            }}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {weddingEndDate && (
                      <div className="space-y-2">
                        <label className="text-sm font-body text-foreground">Tid</label>
                        <div className="flex gap-2">
                          <select
                            value={weddingEndDate.getHours()}
                            onChange={(e) => {
                              const newDate = new Date(weddingEndDate);
                              newDate.setHours(parseInt(e.target.value));
                              setWeddingEndDate(newDate);
                            }}
                            className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-sm"
                          >
                            {Array.from({ length: 24 }, (_, i) => (
                              <option key={i} value={i}>
                                {i.toString().padStart(2, "0")}
                              </option>
                            ))}
                          </select>
                          <span className="flex items-center text-muted-foreground">:</span>
                          <select
                            value={weddingEndDate.getMinutes()}
                            onChange={(e) => {
                              const newDate = new Date(weddingEndDate);
                              newDate.setMinutes(parseInt(e.target.value));
                              setWeddingEndDate(newDate);
                            }}
                            className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-sm"
                          >
                            {Array.from({ length: 60 }, (_, i) => (
                              <option key={i} value={i}>
                                {i.toString().padStart(2, "0")}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {weddingEndDate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setWeddingEndDate(undefined)}
                      >
                        Rensa sluttid
                      </Button>
                    )}
                  </div>
                </div>

                {/* Summary */}
                {(weddingStartDate || weddingEndDate) && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-md">
                    <p className="text-sm text-foreground font-body">
                      {weddingStartDate && (
                        <span>Bröllopet börjar: {format(weddingStartDate, "d MMMM yyyy 'kl' HH:mm", { locale: sv })}</span>
                      )}
                      {weddingStartDate && weddingEndDate && <br />}
                      {weddingEndDate && (
                        <span>Bröllopet slutar: {format(weddingEndDate, "d MMMM yyyy 'kl' HH:mm", { locale: sv })}</span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Upload settings */}
              <div className="bg-card p-6 rounded-xl shadow-soft border border-blush/20">
                <h2 className="text-xl font-serif mb-4 text-foreground">
                  Uppladdning av bilder
                </h2>
                <p className="text-sm text-muted-foreground font-body mb-4">
                  Gäster kan ladda upp bilder från och med det valda datumet och tiden. Detta är oberoende av bröllopstiderna.
                </p>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-body text-foreground">Datum</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !uploadDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {uploadDate ? (
                            format(uploadDate, "d MMMM yyyy", { locale: sv })
                          ) : (
                            "Välj datum"
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={uploadDate}
                          onSelect={(date) => {
                            if (date) {
                              const hours = uploadDate?.getHours() ?? 12;
                              const minutes = uploadDate?.getMinutes() ?? 0;
                              date.setHours(hours, minutes, 0, 0);
                            }
                            setUploadDate(date);
                          }}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {uploadDate && (
                    <div className="space-y-2">
                      <label className="text-sm font-body text-foreground">Tid</label>
                      <div className="flex gap-2">
                        <select
                          value={uploadDate.getHours()}
                          onChange={(e) => {
                            const newDate = new Date(uploadDate);
                            newDate.setHours(parseInt(e.target.value));
                            setUploadDate(newDate);
                          }}
                          className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                          {Array.from({ length: 24 }, (_, i) => (
                            <option key={i} value={i}>
                              {i.toString().padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                        <span className="flex items-center text-muted-foreground">:</span>
                        <select
                          value={uploadDate.getMinutes()}
                          onChange={(e) => {
                            const newDate = new Date(uploadDate);
                            newDate.setMinutes(parseInt(e.target.value));
                            setUploadDate(newDate);
                          }}
                          className="flex-1 h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                          {Array.from({ length: 60 }, (_, i) => (
                            <option key={i} value={i}>
                              {i.toString().padStart(2, "0")}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {uploadDate && (
                    <>
                      <p className="text-sm text-primary font-body">
                        ✓ Uppladdning aktiveras {format(uploadDate, "d MMMM yyyy 'kl' HH:mm", { locale: sv })}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUploadDate(undefined)}
                      >
                        Rensa uppladdningstid
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Save button */}
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveSettings}
                  disabled={savingDate}
                  className="flex-1"
                >
                  {savingDate ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Spara alla inställningar
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Photo preview dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <DialogTitle className="sr-only">
            Förhandsvisning av bild
          </DialogTitle>
          {selectedPhoto && (
            <div className="relative">
              <img
                src={getImageUrl(selectedPhoto.file_path)}
                alt={selectedPhoto.file_name}
                className="w-full h-auto max-h-[80vh] object-contain bg-black"
              />

              {/* Prev / next navigation */}
              {selectedIndex > 0 && (
                <button
                  onClick={() => goToPhoto(-1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                  aria-label="Föregående bild"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              {selectedIndex >= 0 && selectedIndex < orderedPhotos.length - 1 && (
                <button
                  onClick={() => goToPhoto(1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors"
                  aria-label="Nästa bild"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}

              {/* Counter + approval badge */}
              <div className="absolute top-2 left-2 flex gap-2">
                <span className="bg-black/50 text-white text-xs px-2 py-1 rounded-full font-body">
                  {selectedIndex + 1} / {orderedPhotos.length}
                </span>
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full font-body",
                  selectedPhoto.approved
                    ? "bg-primary/80 text-primary-foreground"
                    : "bg-yellow-500/80 text-white"
                )}>
                  {selectedPhoto.approved ? "Godkänd" : "Väntar"}
                </span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <div className="flex items-end justify-between gap-3 flex-wrap">
                  <div>
                    <p className="text-white font-body text-sm">
                      {selectedPhoto.uploaded_by || "Okänd"}
                    </p>
                    <p className="text-white/70 font-body text-xs">
                      {format(new Date(selectedPhoto.created_at), "d MMMM yyyy 'kl' HH:mm", { locale: sv })}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDownloadSingle(selectedPhoto)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Ladda ner
                    </Button>
                    {!selectedPhoto.approved ? (
                      <Button
                        size="sm"
                        onClick={() => handleApprove(selectedPhoto.id, true)}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Godkänn
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprove(selectedPhoto.id, false)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Neka
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        handleDelete(selectedPhoto.id, selectedPhoto.file_path);
                        setSelectedPhoto(null);
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Ta bort
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
