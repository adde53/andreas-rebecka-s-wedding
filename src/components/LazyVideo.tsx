import { useRef, useState, useEffect } from "react";

interface LazyVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
  src: string;
  /** Show play button overlay */
  showPlayButton?: boolean;
  /** Wrapper className for the container */
  wrapperClassName?: string;
}

/**
 * A video component that only loads when it enters the viewport.
 * Reduces initial page load and bandwidth usage.
 */
const LazyVideo = ({ src, showPlayButton = true, wrapperClassName, className, ...props }: LazyVideoProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // Start loading 200px before visible
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {isVisible ? (
        <div ref={containerRef} className={wrapperClassName || "relative"}>
          <video
            src={src}
            className={className}
            muted
            playsInline
            preload="metadata"
            {...props}
          />
          {showPlayButton && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          ref={containerRef}
          className={wrapperClassName || "relative"}
          style={{ minHeight: "150px", background: "#f3f4f6", borderRadius: "1rem" }}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default LazyVideo;
