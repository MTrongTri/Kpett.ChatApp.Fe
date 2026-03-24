"use client";

import { useState } from "react";
import Logo from "./logo";
import NavTabs from "./nav-tab";
import SearchBar from "./search-bar";
import NavIconBtn from "./nav-icon-btn";
import { Bell, MessageSquare } from "lucide-react";
import ComposeButton from "./compose-button";
import UserMenu from "./user-menu";
import MobileMenu from "./mobile-menu";

export default function Header() {
  const [notifCount] = useState(10);
  const [msgCount] = useState(10);

  return (
    <header className="/* Thêm hiệu ứng chuyển màu mượt mà */ fixed top-0 right-0 left-0 z-50 flex h-14.5 items-center gap-0 border-b border-zinc-200 bg-white/80 px-5 backdrop-blur-xl transition-colors duration-300 md:px-7 dark:border-zinc-800 dark:bg-zinc-950/90">
      {/* Logo */}
      <Logo />

      {/* Desktop nav tabs */}
      <NavTabs />

      {/* Search */}
      <SearchBar />

      {/* Right action group */}
      <div className="ml-auto flex shrink-0 items-center gap-1.5 md:ml-0">
        <NavIconBtn
          icon={<Bell size={15} />}
          tooltip="Thông báo"
          badgeCount={notifCount}
        />
        <NavIconBtn
          icon={<MessageSquare size={15} />}
          tooltip="Tin nhắn"
          badgeCount={msgCount}
        />

        <ComposeButton />
        <UserMenu />
        <MobileMenu />
      </div>
    </header>
  );
}
