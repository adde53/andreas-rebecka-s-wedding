import { supabase } from "@/integrations/supabase/client";

/**
 * Get a public URL for a photo from Supabase Storage.
 * Optionally apply server-side image transformations for thumbnails.
 */
export const getImageUrl = (filePath: string) => {
  const { data } = supabase.storage.from("wedding-photos").getPublicUrl(filePath);
  return data.publicUrl;
};

/**
 * Get a transformed (resized) image URL for thumbnails.
 * Uses Supabase Storage Image Transformations for optimal delivery.
 * Falls back to original URL if transformations aren't available.
 */
export const getThumbnailUrl = (
  filePath: string,
  width: number = 400,
  quality: number = 75
) => {
  const { data } = supabase.storage.from("wedding-photos").getPublicUrl(filePath, {
    transform: {
      width,
      quality,
      format: "origin", // Keep original format (avoids issues with some browsers)
    },
  });
  return data.publicUrl;
};

/**
 * Get a medium-sized image URL (for list view or medium previews).
 */
export const getMediumUrl = (
  filePath: string,
  width: number = 800,
  quality: number = 80
) => {
  const { data } = supabase.storage.from("wedding-photos").getPublicUrl(filePath, {
    transform: {
      width,
      quality,
      format: "origin",
    },
  });
  return data.publicUrl;
};

/**
 * Check if a file is a video based on its filename.
 */
export const isVideo = (fileName: string) =>
  /\.(mp4|mov|webm|m4v|3gp|3gpp|quicktime)$/i.test(fileName);

/**
 * Check if a file is a HEIC/HEIF image.
 */
export const isHeicFile = (fileName: string) =>
  /\.(heic|heif)$/i.test(fileName);

