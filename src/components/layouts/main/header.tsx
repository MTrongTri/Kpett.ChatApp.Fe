'use client'

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
    <header
      className="
        fixed top-0 left-0 right-0 z-50
        h-[58px]
        bg-zinc-950/90 backdrop-blur-xl
        border-b border-zinc-800
        flex items-center
        px-5 md:px-7
        gap-0
      "
    >
      {/* Logo */}
      <Logo />

      {/* Desktop nav tabs */}
      <NavTabs />

      {/* Search */}
      <SearchBar />

      {/* Right action group */}
      <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto md:ml-0">
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