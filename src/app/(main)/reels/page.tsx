"use client"

import { Clapperboard } from "lucide-react";
import ComingSoon from "@/components/shared/coming-soon";

export default function ReelsPage() {
  return (
    <ComingSoon
      title="Reels & Video ngắn"
      description="Tính năng video dạng ngắn (Reels) đang được phát triển. Bạn sẽ sớm có thể xem, tạo và chia sẻ các video ngắn thú vị với bạn bè."
      icon={<Clapperboard className="h-12 w-12 text-primary" strokeWidth={1.5} />}
    />
  );
}