"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReelPlayerProps {
  src: string;
  isActive: boolean;
  thumbnailUrl?: string;
  className?: string;
}

export default function ReelPlayer({ src, isActive, thumbnailUrl, className }: ReelPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const controlsTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isVisible = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
      setProgress(0);
      video.currentTime = 0;
    }
  }, [isActive]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible.current = entry.isIntersecting;
        if (!entry.isIntersecting) {
          const video = videoRef.current;
          if (video && !video.paused) {
            video.pause();
            setIsPlaying(false);
          }
        }
      },
      { threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying]);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  }, []);

  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.duration) return;
    setProgress((video.currentTime / video.duration) * 100);
  }, []);

  const handleControlsShow = useCallback(() => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
      if (isActive) {
        video.currentTime = 0;
        video.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    };

    video.addEventListener("ended", handleEnded);
    return () => video.removeEventListener("ended", handleEnded);
  }, [isActive]);

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full bg-black overflow-hidden", className)}
      onClick={togglePlay}
      onMouseMove={handleControlsShow}
    >
      <div className="relative mx-auto h-full w-full max-w-[420px]">
        <video
          ref={videoRef}
          src={src}
          className="h-full w-full object-contain"
          playsInline
          loop={false}
          muted={isMuted}
          onTimeUpdate={handleTimeUpdate}
          onClick={togglePlay}
          onPlay={(e) => {
            const videos = document.querySelectorAll<HTMLVideoElement>("video");
            videos.forEach((vid) => {
              if (vid !== e.currentTarget) {
                vid.pause();
              }
            });
          }}
        />

        {thumbnailUrl && !isActive && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${thumbnailUrl})` }}
          />
        )}

        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity duration-300",
            showControls || !isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          {!isPlaying && (
            <div className="rounded-full bg-black/50 p-4 backdrop-blur-sm">
              <Play className="h-10 w-10 text-white fill-white" />
            </div>
          )}
        </div>

        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 h-1 bg-white/20 transition-opacity",
            showControls && "opacity-100"
          )}
        >
          <div
            className="h-full bg-white transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <button
          onClick={toggleMute}
          className={cn(
            "absolute bottom-4 right-4 z-10 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm transition-opacity",
            showControls ? "opacity-100" : "opacity-0"
          )}
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
