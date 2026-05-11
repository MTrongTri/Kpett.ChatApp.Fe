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

import PostContent from "@/components/posts/post-content";
import { UserAvatar } from "@/components/user/user-avatar";
import { useMediaLightbox } from "@/hooks/post/use-media-lightbox";
import { RootState } from "@/store/store";
import { Media } from "@/types/media";
import { useSelector } from "react-redux";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { MediaLightbox } from "../media-lightbox";
import PostMediaSlider from "../post-media-slider";


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
                  <span className="text-foreground text-sm font-semibold">{user?.displayName}</span>
                  <span className="text-foreground/40 text-[11px]">Vừa xong</span>
                </div>
              </div>

              <div className="min-w-0 flex-1 mt-3">
                {/* Body */}
                <div>
                  <PostContent content={content} />
                </div>

                {/* Slider Xem trước Media */}
                <PostMediaSlider
                  media={media}
                />
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
