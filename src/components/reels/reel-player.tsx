"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { Play, Volume2, VolumeX, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReelPlayerProps {
  src: string;
  isActive: boolean;
  thumbnailUrl?: string;
  className?: string;
  onDoubleTapLike?: () => void;
}

export default function ReelPlayer({
  src,
  isActive,
  thumbnailUrl,
  className,
  onDoubleTapLike,
}: ReelPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const [heartAnim, setHeartAnim] = useState<{ id: number; x: number; y: number } | null>(null);

  const controlsTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastClickTimeRef = useRef<number>(0);
  const singleClickTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Play / Pause video based on isActive
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.currentTime = 0;
      video.play().catch(() => {
        // Autoplay may be blocked if unmuted
      });
    } else {
      video.pause();
    }
  }, [isActive]);

  // Pause when off screen
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          const video = videoRef.current;
          if (video && !video.paused) {
            video.pause();
          }
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, []);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const timeDiff = now - lastClickTimeRef.current;

    if (timeDiff < 280) {
      // Double click detected!
      if (singleClickTimerRef.current) {
        clearTimeout(singleClickTimerRef.current);
      }
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        setHeartAnim({
          id: Date.now(),
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
      onDoubleTapLike?.();
      setTimeout(() => setHeartAnim(null), 850);
      lastClickTimeRef.current = 0;
    } else {
      lastClickTimeRef.current = now;
      singleClickTimerRef.current = setTimeout(() => {
        togglePlay();
      }, 280);
    }
  };

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
    controlsTimer.current = setTimeout(() => setShowControls(false), 2500);
  }, []);

  useEffect(() => {
    return () => {
      if (controlsTimer.current) clearTimeout(controlsTimer.current);
      if (singleClickTimerRef.current) clearTimeout(singleClickTimerRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative h-full w-full bg-black overflow-hidden select-none cursor-pointer flex items-center justify-center",
        className
      )}
      onClick={handleContainerClick}
      onMouseMove={handleControlsShow}
    >
      {/* Blurred background for wide/horizontal video formats */}
      {thumbnailUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center blur-2xl opacity-40 scale-125 pointer-events-none"
          style={{ backgroundImage: `url(${thumbnailUrl})` }}
        />
      )}

      {/* Main Video Element */}
      <video
        ref={videoRef}
        src={src}
        className="relative z-10 h-full w-full object-cover"
        playsInline
        loop
        muted={isMuted}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Static thumbnail when not active */}
      {thumbnailUrl && !isActive && (
        <div
          className="absolute inset-0 z-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${thumbnailUrl})` }}
        />
      )}

      {/* Animated Pop Heart on Double Tap */}
      {heartAnim && (
        <div
          className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-1/2 animate-ping duration-700"
          style={{ left: heartAnim.x, top: heartAnim.y }}
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose-500/80 text-white shadow-2xl backdrop-blur-md">
            <Heart className="h-12 w-12 fill-white text-white drop-shadow-lg" />
          </div>
        </div>
      )}

      {/* Center Play Icon when paused */}
      <div
        className={cn(
          "absolute inset-0 z-20 flex items-center justify-center transition-all duration-300 pointer-events-none",
          !isPlaying ? "opacity-100 scale-100" : "opacity-0 scale-90"
        )}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/60 backdrop-blur-md text-white shadow-xl">
          <Play className="h-8 w-8 fill-white ml-1 text-white" />
        </div>
      </div>

      {/* Sound Mute/Unmute toggle in top-right */}
      <button
        type="button"
        onClick={toggleMute}
        className={cn(
          "absolute top-3.5 right-3.5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all duration-200 hover:bg-black/75 hover:scale-105 active:scale-95 shadow-md",
          showControls || isMuted ? "opacity-100" : "opacity-70 sm:opacity-0 sm:group-hover:opacity-100"
        )}
        title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
      >
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>

      {/* Video Progress Bar at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-1 bg-white/20">
        <div
          className="h-full bg-white/90 transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
