import Feed from "./_components/feed";
import LeftPanel from "./_components/left-panel";
import RightPanel from "./_components/right-panel";
import SpotlightStrip from "./_components/spotlight-strip";


export default function HomePage() {
  return (
    <div className="min-h-screen bg-background pt-[58px]">
      <div
        className="
          grid
          grid-cols-1
          md:grid-cols-[300px_1fr]       
          xl:grid-cols-[300px_1fr_300px]
        "
      >
        {/* ── LEFT PANEL (hidden on mobile) ── */}
        <div className="hidden md:block">
          <LeftPanel />
        </div>

        {/* ── CENTER FEED ── */}
        <div className="min-w-0 px-4 py-5">
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