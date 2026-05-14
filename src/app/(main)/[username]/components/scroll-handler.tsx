"use client";

import { useEffect } from "react";

export default function ScrollHandler({ targetId }: { targetId: string }) {
    useEffect(() => {
        const element = document.getElementById(targetId);
        if (element) {
            setTimeout(() => {
                element.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
            }, 150);
        }
    }, [targetId]);

    return null;
}