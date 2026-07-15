"use client"

import { Bookmark } from "lucide-react";
import ComingSoon from "@/components/shared/coming-soon";

export default function SavedPage() {
  return (
    <ComingSoon
      title="Bài viết đã lưu"
      description="Tính năng lưu bài viết đang được phát triển. Bạn sẽ sớm có thể xem lại các bài viết, video và nội dung đã lưu của mình tại đây."
      icon={<Bookmark className="h-12 w-12 text-primary" strokeWidth={1.5} />}
    />
  );
}