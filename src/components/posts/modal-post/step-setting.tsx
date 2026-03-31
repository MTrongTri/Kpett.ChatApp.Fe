import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Play
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

// Swiper imports
import { Media } from "@/types/media";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import PostContent from "@/app/(main)/components/posts/post-content";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import { UserAvatar } from "@/components/user/user-avatar";
import { useMediaLightbox } from "@/hooks/use-media-lightbox";
import { MediaLightbox } from "../media-lightbox";


interface StepSettingsProps {
  content: string;
  media: Media[];
  allowComments: boolean;
  setAllowComments: (checked: boolean) => void;
}

export default function StepSettings({
  content,
  media,
  allowComments,
  setAllowComments,
}: StepSettingsProps) {

  const {
    isOpen: isOpenMediaLightBox,
    media: mediaLightbox,
    currentIndex,
    openLightbox: openMediaLightBox,
    handleOpenChange,
  } = useMediaLightbox();

  // State cho custom navigation buttons của Swiper
  const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
  const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <div className="flex flex-col gap-5">
      {/* 1. Thẻ Xem Trước (Preview Card) */}
      {
        (content.length > 0 || media.length > 0) && (
          <div className="bg-secondary/20 border-border rounded-xl border p-4">
            <div className="text-muted-foreground mb-3 text-[12px] font-bold">
              Xem trước
            </div>

            <div>
              <div className="flex items-start gap-2">
                <UserAvatar user={user!} />
                <div className="flex flex-col justify-between">
                  <span className="text-foreground text-sm font-semibold">{user?.username}</span>
                  <span className="text-foreground/40 text-[11px]">Vừa xong</span>
                </div>
              </div>

              <div className="min-w-0 flex-1 mt-3">
                {/* Body */}
                <div>
                  <PostContent content={content} />
                </div>

                {/* Slider Xem trước Media */}
                {media && media.length > 0 && (
                  <div className="border-border relative mt-3 aspect-video w-full overflow-hidden rounded-lg border bg-black/5">
                    <Swiper
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
                    >
                      {media.map((item, index) => (
                        <SwiperSlide
                          key={index}
                          className="flex items-center justify-center bg-black/10"
                        >
                          <div className="relative flex h-full w-full items-center justify-center">
                            {item.type.toLocaleLowerCase() === "image" ? (
                              <div className="relative h-full w-full">
                                <Image
                                  src={item.url}
                                  alt={`Preview media ${index}`}
                                  fill
                                  className="object-cover"
                                  quality={100}
                                  unoptimized
                                  onClick={() => openMediaLightBox(mediaLightbox, index)}
                                />
                              </div>
                            ) : (
                              <div
                                className="group/video relative h-full w-full cursor-pointer"
                                onClick={() => openMediaLightBox(mediaLightbox, index)}
                              >
                                <video
                                  src={item.url}
                                  className="h-full w-full object-cover"
                                  preload="metadata"
                                />
                                {/* Overlay làm tối nhẹ và Nút Play */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-all group-hover/video:bg-black/25">
                                  <Play className="h-14 w-14 text-white opacity-90 drop-shadow-lg transition-transform duration-200 group-hover/video:scale-110" />
                                </div>
                              </div>
                            )}
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>

                    {/* Điều hướng Slider (Chỉ hiện khi có hơn 1 ảnh) */}
                    {media.length > 1 && (
                      <>
                        <button
                          ref={setPrevEl}
                          className="absolute top-1/2 left-2 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-black/50 p-1.5 text-white transition-all hover:bg-black/80 disabled:hidden"
                          aria-label="Previous slide"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                          ref={setNextEl}
                          className="absolute top-1/2 right-2 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-black/50 p-1.5 text-white transition-all hover:bg-black/80 disabled:hidden"
                          aria-label="Next slide"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }

      {/* 2. Cài đặt Cho phép Bình luận */}
      <div className="border-border bg-secondary/20 hover:bg-secondary/30 flex items-center justify-between rounded-xl border p-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="bg-background border-primary rounded-lg p-2 shadow-sm">
            <MessageSquare className="text-primary h-5 w-5" />
          </div>
          <div>
            <Label
              className="cursor-pointer text-sm font-medium"
              onClick={() => setAllowComments(!allowComments)}
            >
              Cho phép bình luận
            </Label>
            <div className="text-muted-foreground mt-0.5 text-xs">
              Mọi người có thể bình luận vào bài viết này
            </div>
          </div>
        </div>
        <Switch
          checked={allowComments}
          onCheckedChange={setAllowComments}
          className="data-[state=checked]:bg-primary"
        />

      </div>
      <MediaLightbox
        isOpen={isOpenMediaLightBox}
        onOpenChange={handleOpenChange}
        media={media}
        initialIndex={currentIndex}
        className="top-0 right-0 bottom-0 left-0 flex h-screen max-w-none! translate-x-0 translate-y-0"
      />

    </div>
  );
}
