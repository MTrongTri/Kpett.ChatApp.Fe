"use client";

import { getOptimizedCloudinaryUrl } from "@/lib/cloudinary-utils";
import { openMediaLightBox } from "@/store/features/modal-slice";
import { Media } from "@/types/media";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

interface PostMediaSliderProps {
    media: Media[];
}

export default function PostMediaSlider({ media }: PostMediaSliderProps) {
    const [prevEl, setPrevEl] = useState<HTMLButtonElement | null>(null);
    const [nextEl, setNextEl] = useState<HTMLButtonElement | null>(null);

    const dispatch = useDispatch();

    if (!media || media.length === 0) return null;

    return (
        <div className="mx-4 mb-3">
            <div className="border-border group relative h-100 w-full overflow-hidden rounded-xl border">
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
                                            className="object-cover cursor-pointer"
                                            onClick={() => dispatch(openMediaLightBox({ media, index }))}
                                        />
                                    ) : (
                                        <div
                                            className="group/video relative h-full w-full cursor-pointer"
                                            onClick={() => dispatch(openMediaLightBox({ media, index }))}
                                        >
                                            <video
                                                src={optimizedUrl}
                                                className="h-full w-full object-cover"
                                                preload="metadata"
                                                playsInline
                                            />
                                            {/* Overlay làm tối nhẹ và Nút Play */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-all group-hover/video:bg-black/25">
                                                <Play className="h-14 w-14 text-white opacity-90 drop-shadow-lg transition-transform duration-200 group-hover/video:scale-110" />
                                            </div>
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