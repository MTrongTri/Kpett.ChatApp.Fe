"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import SuggestionsCard from "./suggestion-card";
import ActivityCard from "./activity-card";

// ── SUB-COMPONENTS ───────────────────────────────────────────────────

function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2.5 flex items-center justify-between">
      <p className="text-foreground text-sm font-semibold">{children}</p>
    </div>
  );
}

// ── MAIN EXPORT ──────────────────────────────────────────────────────
export default function RightPanel() {
  return (
    <aside className="sticky top-14.5 h-[calc(100vh-58px)]">
      <ScrollArea className="h-full overscroll-contain">
        <div className="max-w-75 space-y-5 px-3 py-5">
          <div>
            <PanelLabel>Gợi ý bạn bè</PanelLabel>
            <SuggestionsCard />
          </div>

          <div>
            {/* <PanelLabel>Hoạt động gần đây</PanelLabel>
            <ActivityCard /> */}
          </div>
        </div>
      </ScrollArea>
    </aside>
  );
}
