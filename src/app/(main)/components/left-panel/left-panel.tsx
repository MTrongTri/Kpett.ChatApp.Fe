"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import ProfileCard from "./profile-card";
import OnlineFriends from "./online-friends";

// ---SUB-COMPONENTS---

function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-foreground mt-5 mb-2.5 px-2.5 text-sm font-semibold first:mt-0">
      {children}
    </p>
  );
}

// ── MAIN EXPORT ──────────────────────────────────────────────────────
export default function LeftPanel() {
  return (
    <aside className="sticky top-14.5 h-[calc(100vh-58px)]">
      <ScrollArea className="h-full">
        <div className="px-3 py-5">
          <ProfileCard />

          <PanelLabel>Bạn bè Online</PanelLabel>
          <OnlineFriends />
        </div>
      </ScrollArea>
    </aside>
  );
}
