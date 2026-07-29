"use client";

import { getOptimizedCloudinaryUrl } from "@/lib/cloudinary-utils";
import { openMediaLightBox } from "@/store/features/modal-slice";
import { Media } from "@/types/media";
import { ChevronLeft, ChevronRight, Play, Maximize2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
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

    const visiblePlayingIndex = inView ? playingIndex : null;

    const dispatch = useDispatch();

    const openLightbox = (index: number) => {
        if (media[index]?.type.toLowerCase() === "image") {
            dispatch(openMediaLightBox({ media, index }));
        }
    };

    const requestVideoFullscreen = (index: number) => {
        const video = document.querySelector<HTMLVideoElement>(`.post-media-slider video[data-index="${index}"]`);
        if (!video) {
            setPlayingIndex(index);
            requestAnimationFrame(() => {
                const el = document.querySelector<HTMLVideoElement>(`.post-media-slider video[data-index="${index}"]`);
                el?.requestFullscreen();
            });
        } else {
            video.requestFullscreen();
        }
    };

    if (!media || media.length === 0) return null;

    const isBlurred = isNsfw && !showNsfwContent;

    return (
        <div ref={ref} className="md:mx-4 md:mb-3">
            <div className={cn("border-border group relative h-100 w-full overflow-hidden md:rounded-xl border", isBlurred && "blur-xl select-none pointer-events-none")}>
                <Swiper
                    modules={[Navigation, Pagination]}
                    pagination={{ clickable: true }}
                    navigation={{
                        prevEl: prevEl,
                        nextEl: nextEl,
                    }}
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
                    className="h-full w-full"
                >
                    {media.map((item, index) => {
                        const isImage = item.type.toLocaleLowerCase() === "image";
                        const optimizedUrl = getOptimizedCloudinaryUrl(
                            item.url,
                            isImage ? "image" : "video"
                        );

                        return (
                            <SwiperSlide key={index}>
                                <div className="relative h-full w-full bg-black/5">
                                    {isImage ? (
                                        <Image
                                            src={optimizedUrl}
                                            alt="Post media"
                                            fill
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            className="object-contain cursor-pointer"
                                            onClick={() => openLightbox(index)}
                                        />
                                    ) : visiblePlayingIndex === index ? (
                                        <>
                                            <video
                                                src={optimizedUrl}
                                                data-index={index}
                                                className="post-media-slider h-full w-full bg-black object-contain [&:fullscreen]:object-contain [&:fullscreen]:h-dvh"
                                                controls
                                                autoPlay
                                                loop
                                                playsInline
                                                onPlay={(e) => {
                                                    const videos = document.querySelectorAll<HTMLVideoElement>(".post-media-slider video");
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
                                                    requestVideoFullscreen(index);
                                                }}
                                                className="absolute top-3 right-3 z-10 rounded-lg bg-black/50 p-1.5 text-white backdrop-blur-sm transition-all hover:bg-black/70"
                                                title="Xem toàn màn hình"
                                            >
                                                <Maximize2 className="h-5 w-5" />
                                            </button>
                                        </>
                                    ) : (
                                        <div
                                            className="group/video relative h-full w-full cursor-pointer"
                                            onClick={() => setPlayingIndex(index)}
                                        >
                                            <video
                                                src={optimizedUrl}
                                                data-index={index}
                                                className="post-media-slider h-full w-full object-cover [&:fullscreen]:object-contain [&:fullscreen]:h-dvh"
                                                preload="metadata"
                                                playsInline
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-all group-hover/video:bg-black/25">
                                                <Play className="h-14 w-14 text-white opacity-90 drop-shadow-lg transition-transform duration-200 group-hover/video:scale-110" />
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    requestVideoFullscreen(index);
                                                }}
                                                className="absolute top-3 right-3 z-10 rounded-lg bg-black/40 p-1.5 text-white opacity-0 backdrop-blur-sm transition-all hover:bg-black/70 group-hover/video:opacity-100 md:opacity-0"
                                                title="Xem toàn màn hình"
                                            >
                                                <Maximize2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
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