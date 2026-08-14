import { useState, useEffect, useRef } from "react";

interface HeicImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fileName?: string;
}

const isHeicFile = (src: string, fileName?: string): boolean => {
  const heicPattern = /\.(heic|heif)($|\?)/i;
  return heicPattern.test(src) || (!!fileName && heicPattern.test(fileName));
};

// Lazy-load heic2any only when needed (it's ~1.3MB)
let heic2anyModule: Promise<typeof import("heic2any")> | null = null;
const getHeic2Any = async () => {
  if (!heic2anyModule) {
    heic2anyModule = import("heic2any");
  }
  const mod = await heic2anyModule;
  return mod.default;
};

const HeicImage = ({ src, fileName, loading = "lazy", ...props }: HeicImageProps) => {
  const needsConversion = isHeicFile(src, fileName);
  const [convertedSrc, setConvertedSrc] = useState<string | null>(needsConversion ? null : src);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(needsConversion);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    // Cleanup previous blob URL
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }

    if (!isHeicFile(src, fileName)) {
      setConvertedSrc(src);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(false);

    const convert = async () => {
      try {
        const response = await fetch(src, { mode: "cors" });
        if (!response.ok) {
          throw new Error(`Fetch failed: ${response.status}`);
        }
        const blob = await response.blob();

        const heicBlob = new Blob([await blob.arrayBuffer()], { type: "image/heic" });

        const heic2any = await getHeic2Any();
        const result = await heic2any({
          blob: heicBlob,
          toType: "image/jpeg",
          quality: 0.85
        });

        const jpegBlob = Array.isArray(result) ? result[0] : result;

        if (!cancelled) {
          const url = URL.createObjectURL(jpegBlob);
          blobUrlRef.current = url;
          setConvertedSrc(url);
          setIsLoading(false);
        }
      } catch (e) {
        console.error("HEIC conversion failed for:", fileName || src, e);
        if (!cancelled) {
          setError(true);
          setIsLoading(false);
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

  // Only show placeholder for HEIC files that are being converted
  if (isLoading) {
    return (
      <div
        className={props.className}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f3f4f6",
          minHeight: "100px",
        }}
        role="img"
        aria-label="Laddar bild..."
      >
        <span className="text-xs text-gray-400 animate-pulse">Konverterar bild...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={props.className}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f3f4f6",
          minHeight: "100px",
        }}
      >
        <span className="text-xs text-gray-500">Kunde inte visa bilden</span>
      </div>
    );
  }

  return (
    <img
      {...props}
      src={convertedSrc!}
      loading={loading}
      decoding="async"
    />
  );
};

export default HeicImage;
export { isHeicFile };
