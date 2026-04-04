"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";

interface VideoBackgroundProps {
  src: string;
  poster?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function VideoBackground({ src, poster, className = "", style }: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (src.endsWith(".m3u8")) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          startLevel: -1,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
        return () => hls.destroy();
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        video.addEventListener("loadedmetadata", () => {
          video.play().catch(() => {});
        });
      }
    } else {
      video.src = src;
      video.play().catch(() => {});
    }
  }, [src]);

  return (
    <video
      ref={videoRef}
      className={`absolute w-full h-full object-cover z-0 ${className}`}
      style={style}
      poster={poster}
      muted
      loop
      playsInline
      autoPlay
    />
  );
}
