"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { MediaAsset } from "@/types/media";
import { mediaPoster } from "@/types/media";

type MediaFrameMode = "image" | "preview" | "ambient" | "interactive";

type MediaFrameProps = {
  asset?: MediaAsset | null;
  fallbackSrc?: string;
  alt: string;
  mode?: MediaFrameMode;
  className?: string;
  mediaClassName?: string;
  eager?: boolean;
  controls?: boolean;
  overlay?: ReactNode;
};

function useMediaPreferences() {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [saveData, setSaveData] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReduceMotion(query.matches);
    updateMotion();
    query.addEventListener("change", updateMotion);

    const connection = (
      navigator as Navigator & { connection?: { saveData?: boolean } }
    ).connection;
    setSaveData(Boolean(connection?.saveData));

    return () => query.removeEventListener("change", updateMotion);
  }, []);

  return { reduceMotion, saveData };
}

export function MediaFrame({
  asset,
  fallbackSrc = "",
  alt,
  mode = "image",
  className = "",
  mediaClassName = "object-cover",
  eager = false,
  controls,
  overlay,
}: MediaFrameProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { reduceMotion, saveData } = useMediaPreferences();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [asset?.type, asset?.url, fallbackSrc]);

  const poster = mediaPoster(asset, fallbackSrc);
  const isVideo = asset?.type === "video" && Boolean(asset.url.trim());
  const isInteractive = mode === "interactive";
  const showPosterOnly =
    !isVideo ||
    mode === "image" ||
    failed ||
    ((reduceMotion || saveData) && !isInteractive);
  const shouldControl = controls ?? isInteractive;
  const shouldAutoplay = mode === "ambient" && !reduceMotion && !saveData;

  const resolvedImage = useMemo(() => {
    if (asset?.type === "image" && asset.url.trim()) {
      if (!failed) return asset.url;
      return fallbackSrc && fallbackSrc !== asset.url ? fallbackSrc : "";
    }
    if (!asset && failed) return "";
    return poster;
  }, [asset, failed, fallbackSrc, poster]);

  const playPreview = () => {
    if (mode !== "preview" || reduceMotion || saveData) return;
    void videoRef.current?.play().catch(() => undefined);
  };

  const pausePreview = () => {
    if (mode !== "preview") return;
    videoRef.current?.pause();
    if (videoRef.current) videoRef.current.currentTime = 0;
  };

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      onMouseEnter={playPreview}
      onMouseLeave={pausePreview}
      onFocusCapture={playPreview}
      onBlurCapture={pausePreview}
    >
      {showPosterOnly ? (
        resolvedImage ? (
          <img
            src={resolvedImage}
            alt={alt}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            onError={() => setFailed(true)}
            className={`h-full w-full ${mediaClassName}`}
          />
        ) : (
          <div
            role="img"
            aria-label={alt}
            className="grid h-full w-full place-items-center bg-[var(--paper)] px-6 text-center text-xs uppercase tracking-[0.18em] text-[var(--muted)]"
          >
            Media pending
          </div>
        )
      ) : (
        <video
          ref={videoRef}
          src={asset.url}
          poster={poster || undefined}
          aria-label={alt}
          controls={shouldControl}
          autoPlay={shouldAutoplay}
          muted={mode !== "interactive"}
          loop={mode === "ambient" || mode === "preview"}
          playsInline
          preload={shouldAutoplay ? "auto" : "metadata"}
          onError={() => setFailed(true)}
          className={`h-full w-full ${mediaClassName}`}
        />
      )}
      {asset?.type === "video" && showPosterOnly && poster ? (
        <span className="pointer-events-none absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-black/68 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur-sm">
          <span aria-hidden className="text-[8px]">▶</span>
          Video
        </span>
      ) : null}
      {overlay}
    </div>
  );
}
