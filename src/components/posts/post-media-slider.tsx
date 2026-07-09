"use client";

import { getOptimizedCloudinaryUrl } from "@/lib/cloudinary-utils";
import { openMediaLightBox } from "@/store/features/modal-slice";
import { Media } from "@/types/media";
import { ChevronLeft, ChevronRight, Play, Maximize2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useDispatch } from "react-redux";
import { cn } from "@/lib/utils";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

interface PostMediaSliderProps {
    media: Media[];
    isNsfw?: boolean;
    showNsfwContent?: boolean;
}

export default function PostMediaSlider({ media, isNsfw, showNsfwContent }: PostMediaSliderProps) {
    const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);
    const [playingIndex, setPlayingIndex] = useState<number | null>(null);

    const { ref, inView } = useInView({
        threshold: 0,
    });

    useEffect(() => {
        if (!inView && playingIndex !== null) {
            setPlayingIndex(null);
        }
    }, [inView, playingIndex]);

    const dispatch = useDispatch();

    if (!media || media.length === 0) return null;

    const isBlurred = isNsfw && !showNsfwContent;

    return (
        <div ref={ref} className="md:mx-4 md:mb-3">
            <div className={cn("border-border group relative w-full overflow-hidden md:rounded-xl border bg-black/5", isBlurred && "blur-xl select-none pointer-events-none")}>
                <Swiper
                    modules={[Navigation, Pagination]}
                    pagination={{ clickable: true }}
                    navigation={{
                        prevEl: prevEl,
                        nextEl: nextEl,
                    }}
                    autoHeight={true}
                    onSlideChange={() => setPlayingIndex(null)}
                    onBeforeInit={(swiper) => {
                        if (
                            swiper.params.navigation &&
                            typeof swiper.params.navigation !== "boolean"
                        ) {
                            swiper.params.navigation.prevEl = prevEl;
                            swiper.params.navigation.nextEl = nextEl;
                        }
                    }}
                    className="w-full"
                >
                    {media.map((item, index) => {
                        const isImage = item.type.toLocaleLowerCase() === "image";
                        const optimizedUrl = getOptimizedCloudinaryUrl(
                            item.url,
                            isImage ? "image" : "video"
                        );

                        return (
                            <SwiperSlide key={index}>
                                {isImage ? (
                                    <div className="relative w-full" style={{ maxHeight: '80vh' }}>
                                        <img
                                            src={optimizedUrl}
                                            alt="Post media"
                                            className="w-full h-auto max-h-[80vh] object-contain cursor-pointer"
                                            onClick={() => dispatch(openMediaLightBox({ media, index }))}
                                        />
                                    </div>
                                ) : playingIndex === index ? (
                                    <div className="relative w-full bg-black" style={{ maxHeight: '80vh' }}>
                                        <video
                                            src={optimizedUrl}
                                            className="w-full h-auto max-h-[80vh] bg-black object-contain"
                                            controls
                                            autoPlay
                                            loop
                                            playsInline
                                            onPlay={(e) => {
                                                const videos = document.querySelectorAll("video");
                                                videos.forEach((vid) => {
                                                    if (vid !== e.currentTarget) {
                                                        vid.pause();
                                                    }
                                                });
                                            }}
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                dispatch(openMediaLightBox({ media, index }));
                                            }}
                                            className="absolute top-3 right-3 z-10 rounded-lg bg-black/50 p-1.5 text-white backdrop-blur-sm transition-all hover:bg-black/70"
                                            title="Mở hộp thoại toàn màn hình"
                                        >
                                            <Maximize2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div
                                        className="group/video relative w-full cursor-pointer"
                                        style={{ maxHeight: '80vh' }}
                                        onClick={() => setPlayingIndex(index)}
                                    >
                                        <video
                                            src={optimizedUrl}
                                            className="w-full h-auto max-h-[80vh] object-cover"
                                            preload="metadata"
                                            playsInline
                                        />
                                        {/* Overlay làm tối nhẹ và Nút Play */}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-all group-hover/video:bg-black/25">
                                            <Play className="h-14 w-14 text-white opacity-90 drop-shadow-lg transition-transform duration-200 group-hover/video:scale-110" />
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                dispatch(openMediaLightBox({ media, index }));
                                            }}
                                            className="absolute top-3 right-3 z-10 rounded-lg bg-black/40 p-1.5 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-black/70 group-hover/video:opacity-100 md:opacity-0"
                                            title="Mở hộp thoại toàn màn hình"
                                        >
                                            <Maximize2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                )}
                            </SwiperSlide>
                        );
                    })}
                </Swiper>

                {/* Custom button Previous / Next */}
                {media.length > 1 && (
                    <>
                        <button
                            ref={(node) => setPrevEl(node)}
                            className="absolute top-1/2 left-3 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/70 p-1.5 shadow-md transition-all hover:bg-white disabled:hidden md:opacity-0 md:group-hover:opacity-100"
                            aria-label="Previous slide"
                        >
                            <ChevronLeft className="h-5 w-5 text-black" />
                        </button>

                        <button
                            ref={(node) => setNextEl(node)}
                            className="absolute top-1/2 right-3 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/70 p-1.5 shadow-md transition-all hover:bg-white disabled:hidden md:opacity-0 md:group-hover:opacity-100"
                            aria-label="Next slide"
                        >
                            <ChevronRight className="h-5 w-5 text-black" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}