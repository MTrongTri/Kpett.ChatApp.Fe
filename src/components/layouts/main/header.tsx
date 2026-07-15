"use client";

import ChatHeaderDropdown from "@/components/chat/chat-dropdown";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import ComposeButton from "./compose-button";
import GuestThemeToggle from "./guest-theme-toggle";
import Logo from "./logo";
import MobileMenu from "./mobile-menu";
import NavTabs from "./nav-tab";
import NotificationDropdown from "./notification-dropdown";
import SearchBar from "./search-bar";
import UserMenu from "./user-menu";

export default function Header() {
  const { user } = useAuth();

  return (
    <header className="fixed gap-4 top-0 right-0 left-0 z-50 flex h-14.5 items-center border-b border-border bg-background/80 px-5 backdrop-blur-xl transition-colors duration-300 md:px-7">
      {/* Logo */}
      <Logo />

      {/* Desktop nav tabs */}
      <NavTabs />

      {/* Search */}
      <SearchBar />

      {/* Right action group */}
      <div className="ml-auto flex shrink-0 gap-2 items-center md:gap-4 md:ml-0">

        {user ? (
          <>
            {/* <NavIconBtn
              icon={<Bell size={15} />}
              tooltip="Thông báo"
              badgeCount={notifCount}
            /> */}
            {/* <NavIconBtn
              icon={<MessageSquare size={15} />}
              tooltip="Tin nhắn"
              badgeCount={msgCount}
            /> */}

            <NotificationDropdown />

            <ChatHeaderDropdown />

            <ComposeButton />
            <UserMenu />
          </>
        ) : (
          <>
            {/* Menu Theme cho khách */}
            <GuestThemeToggle />

            <Button asChild variant="default" size="sm" className="hidden h-9 rounded-full px-5 font-semibold md:inline-flex">
              <Link href="/login">Đăng nhập</Link>
            </Button>
          </>
        )}

        <MobileMenu />
      </div>
    </header>
  );
}
