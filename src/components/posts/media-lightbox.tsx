"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Media } from "@/types/media";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

interface MediaLightboxProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  media: Media[];
  initialIndex?: number;
  className?: string;
}

export function MediaLightbox({
  isOpen,
  onOpenChange,
  media,
  initialIndex = 0,
  className,
}: MediaLightboxProps) {
  if (!media || media.length === 0) return null;

  const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex items-center justify-center rounded-none border-none bg-black/95 p-0 shadow-none backdrop-blur-sm outline-none",
          className,
        )}
      >
        <DialogTitle className="sr-only">Xem phương tiện chi tiết</DialogTitle>

        {/* Nút đóng */}
        <DialogClose className="absolute top-4 right-4 z-60 cursor-pointer rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20">
          <X className="h-6 w-6" />
        </DialogClose>

        <div className="relative h-full w-full">
          <Swiper
            key={initialIndex}
            initialSlide={initialIndex}
            modules={[Navigation, Pagination]}
            pagination={{ clickable: true }}
            navigation={{
              prevEl: prevEl,
              nextEl: nextEl,
            }}
            onBeforeInit={(swiper) => {
              if (
                swiper.params.navigation &&
                typeof swiper.params.navigation !== "boolean"
              ) {
                swiper.params.navigation.prevEl = prevEl;
                swiper.params.navigation.nextEl = nextEl;
              }
            }}
            className="swiper-lightbox h-full w-full"
            // Cập nhật slide khi prop initialIndex thay đổi
          >
            {media.map((item, index) => (
              <SwiperSlide
                key={index}
                className="flex items-center justify-center p-4"
              >
                <div className="relative flex h-full w-full items-center justify-center">
                  {item.type === "image" ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={item.url}
                        alt={`Media detail ${index}`}
                        fill
                        className="object-contain"
                        quality={100}
                        unoptimized
                      />
                    </div>
                  ) : (
                    <video
                      src={item.url}
                      controls
                      autoPlay
                      className="max-h-full max-w-full shadow-2xl"
                    />
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Nút Previous */}
          <button
            ref={(node) => setPrevEl(node)}
            className="absolute top-1/2 left-4 z-70 -translate-y-1/2 cursor-pointer rounded-full bg-black/50 p-2 text-white transition-all hover:bg-black/80 disabled:hidden"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          {/* Nút Next */}
          <button
            ref={(node) => setNextEl(node)}
            className="absolute top-1/2 right-4 z-70 -translate-y-1/2 cursor-pointer rounded-full bg-black/50 p-2 text-white transition-all hover:bg-black/80 disabled:hidden"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
