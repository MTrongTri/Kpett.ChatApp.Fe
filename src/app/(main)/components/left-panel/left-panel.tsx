"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import ProfileCard from "./profile-card";
import OnlineFriends from "./online-friends";

// ── MAIN EXPORT ──────────────────────────────────────────────────────
export default function LeftPanel() {
  return (
    <aside className="sticky top-14.5 h-[calc(100vh-58px)]">
      <ScrollArea className="h-full">
        <div className="px-3 py-5 space-y-3">
          <ProfileCard />

          <OnlineFriends />
        </div>
      </ScrollArea>
    </aside>
  );
}
