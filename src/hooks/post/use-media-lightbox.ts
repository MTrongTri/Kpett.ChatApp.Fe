import { useState, useCallback } from "react";
import { Media } from "@/types/media";

export function useMediaLightbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [media, setMedia] = useState<Media[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Nhận vào mảng media và vị trí ảnh được click
  const openLightbox = useCallback((mediaData: Media[], index: number = 0) => {
    setMedia(mediaData);
    setCurrentIndex(index);
    setIsOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  return {
    isOpen,
    media,
    currentIndex,
    openLightbox,
    closeLightbox,
    handleOpenChange,
  };
}
