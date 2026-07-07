"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, PackageOpen } from "lucide-react";
import { stickerService, StickerPackResponse } from "@/services/sticker.service";
import { cn } from "@/lib/utils";

interface StickerPickerProps {
  onStickerSelect: (stickerUrl: string) => void;
}

export function StickerPicker({ onStickerSelect }: StickerPickerProps) {
  const [activePackId, setActivePackId] = useState<string | null>(null);

  const { data: myPacks = [], isLoading: isMyPacksLoading } = useQuery({
    queryKey: ["sticker-packs-my"],
    queryFn: () => stickerService.getMyPacks(),
  });

  const { data: publicPacks = [], isLoading: isPublicPacksLoading } = useQuery({
    queryKey: ["sticker-packs-public"],
    queryFn: () => stickerService.getPublicPacks(),
  });

  const allPacks = [...myPacks, ...publicPacks];
  const activePack = allPacks.find((p) => p.id === activePackId) || allPacks[0];

  useEffect(() => {
    if (!activePackId && allPacks.length > 0) {
      setActivePackId(allPacks[0].id);
    }
  }, [allPacks, activePackId]);

  const stickers = activePack?.stickers ?? [];

  if (isMyPacksLoading || isPublicPacksLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (allPacks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
          <PackageOpen size={22} className="text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">
          Bạn chưa có sticker nào.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="flex gap-1 border-b border-border px-2 py-2 overflow-x-auto">
        {allPacks.map((pack) => (
          <button
            key={pack.id}
            onClick={() => setActivePackId(pack.id)}
            className={cn(
              "shrink-0 rounded-lg border p-1.5 transition-colors",
              activePackId === pack.id
                ? "border-primary bg-primary/10"
                : "border-transparent hover:bg-muted",
            )}
            title={pack.name}
          >
            {pack.thumbnailUrl ? (
              <img
                src={pack.thumbnailUrl}
                alt={pack.name}
                className="h-8 w-8 rounded object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded bg-muted text-xs font-bold text-muted-foreground">
                {pack.name.charAt(0).toUpperCase()}
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-1 overflow-y-auto p-2 max-h-64">
        {stickers.map((sticker) => (
          <button
            key={sticker.id}
            onClick={() => onStickerSelect(sticker.mediaUrl)}
            className="group rounded-lg border border-transparent p-1 transition-colors hover:border-primary/30 hover:bg-muted/50"
          >
            <img
              src={sticker.mediaUrl}
              alt={sticker.emoji || "sticker"}
              className="h-full w-full object-contain"
              loading="lazy"
            />
          </button>
        ))}
        {stickers.length === 0 && (
          <div className="col-span-4 py-8 text-center text-xs text-muted-foreground">
            Chưa có sticker trong pack này.
          </div>
        )}
      </div>

      {allPacks.length > 1 && (
        <div className="flex justify-center gap-1 border-t border-border py-2">
          {allPacks.slice(0, 5).map((pack) => (
            <button
              key={pack.id}
              onClick={() => setActivePackId(pack.id)}
              className={cn(
                "h-1.5 w-6 rounded-full transition-colors",
                activePackId === pack.id
                  ? "bg-primary"
                  : "bg-muted-foreground/30 hover:bg-muted-foreground/50",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
