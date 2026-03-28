import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { Media } from "@/types/media";
import { useMediaLightbox } from "@/hooks/use-media-lightbox";
import { MediaLightbox } from "../media-lightbox";

interface PostMediaCarouselProps {
  media: Media[];
  postId: string;
}

export function PostMediaCarousel({ media, postId }: PostMediaCarouselProps) {
  const {
    isOpen: isLightboxOpen,
    currentIndex: currentMediaIndex,
    media: mediaData,
    openLightbox,
    handleOpenChange,
  } = useMediaLightbox();

  if (!media || media.length === 0) return null;

  const prevBtnId = `prev-btn-${postId}`;
  const nextBtnId = `next-btn-${postId}`;

  return (
    <div className="mt-3 w-full shrink-0">
      <div className="border-border group [&_.swiper-pagination-bullet-active]:bg-primary relative h-100 w-full overflow-hidden rounded-xl border">
        <Swiper
          modules={[Navigation, Pagination]}
          pagination={{ clickable: true }}
          navigation={{
            prevEl: `#${prevBtnId}`,
            nextEl: `#${nextBtnId}`,
          }}
          className="h-full w-full"
        >
          {media.map((item, index) => (
            <SwiperSlide key={index}>
              <div className="relative h-full w-full bg-black/5">
                {item.type.toLocaleLowerCase() === "image" ? (
                  <Image
                    src={item.url}
                    alt="Post media"
                    fill
                    className="object-cover"
                    onClick={() => openLightbox(media, index)}
                  />
                ) : (
                  <video
                    src={item.url}
                    controls
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom button Previous/ Next */}
        {media.length > 1 && (
          <>
            <button
              id={prevBtnId}
              className="absolute top-1/2 left-3 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/70 p-1.5 shadow-md transition-all hover:bg-white disabled:hidden md:opacity-0 md:group-hover:opacity-100"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5 text-black" />
            </button>

            <button
              id={nextBtnId}
              className="absolute top-1/2 right-3 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/70 p-1.5 shadow-md transition-all hover:bg-white disabled:hidden md:opacity-0 md:group-hover:opacity-100"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5 text-black" />
            </button>
          </>
        )}
      </div>

      <MediaLightbox
        isOpen={isLightboxOpen}
        onOpenChange={handleOpenChange}
        media={mediaData}
        initialIndex={currentMediaIndex}
        className="top-0 right-0 bottom-0 left-0 flex h-screen max-w-none! translate-x-0 translate-y-0"
      />
    </div>
  );
}
