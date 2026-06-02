import { useState, useEffect, useRef } from "react";
import heic2any from "heic2any";

interface HeicImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fileName?: string;
}

const isHeicFile = (src: string, fileName?: string): boolean => {
  const heicPattern = /\.(heic|heif)($|\?)/i;
  return heicPattern.test(src) || (!!fileName && heicPattern.test(fileName));
};

const HeicImage = ({ src, fileName, ...props }: HeicImageProps) => {
  const [convertedSrc, setConvertedSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    // Cleanup previous blob URL
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    if (!isHeicFile(src, fileName)) {
      setConvertedSrc(src);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(false);

    const convert = async () => {
      try {
        const response = await fetch(src, { mode: "cors" });
        if (!response.ok) {
          throw new Error(`Fetch failed: ${response.status}`);
        }
        const blob = await response.blob();

        // Always force HEIC mime type since we know from filename it's HEIC
        const heicBlob = new Blob([await blob.arrayBuffer()], { type: "image/heic" });

        const result = await heic2any({
          blob: heicBlob,
          toType: "image/jpeg",
          quality: 0.85
        });

        // heic2any can return a single blob or array of blobs
        const jpegBlob = Array.isArray(result) ? result[0] : result;

        if (!cancelled) {
          const url = URL.createObjectURL(jpegBlob);
          blobUrlRef.current = url;
          setConvertedSrc(url);
          setLoading(false);
        }
      } catch (e) {
        console.error("HEIC conversion failed for:", fileName || src, e);
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    };
    convert();

    return () => {
      cancelled = true;
    };
  }, [src, fileName]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <div className={props.className} style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6", minHeight: "100px" }}>
        <span className="text-xs text-gray-400 animate-pulse">Konverterar bild...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={props.className} style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6", minHeight: "100px" }}>
        <span className="text-xs text-gray-500">Kunde inte visa bilden</span>
      </div>
    );
  }

  return <img {...props} src={convertedSrc!} />;
};

export default HeicImage;
export { isHeicFile };


