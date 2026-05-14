import Feed from "./components/posts/feed";
import LeftPanel from "./components/left-panel/left-panel";
import RightPanel from "./components/right-panel/right-panel";
import SpotlightStrip from "./components/story/spotlight-strip";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Bảng tin",
  description:
    "Theo dõi bài viết mới, cập nhật hoạt động và kết nối với bạn bè trên Kpett ChatApp.",
  path: "/",
});

export default function HomePage() {
  return (
    <div className="bg-background min-h-screen pt-14.5">
      <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] xl:grid-cols-[300px_1fr_300px]">
        {/* ── LEFT PANEL (hidden on mobile) ── */}
        <div className="hidden md:block">
          <LeftPanel />
        </div>

        {/* ── CENTER FEED ── */}
        <div className="min-w-0 md:px-4 md:py-5">
          <SpotlightStrip />
          <Feed />
        </div>

        {/* ── RIGHT PANEL (visible only on xl) ── */}
        <div className="hidden xl:block">
          <RightPanel />
        </div>
      </div>
    </div>
  );
}
