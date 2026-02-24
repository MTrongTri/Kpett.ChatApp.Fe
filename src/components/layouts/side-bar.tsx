"use client";

import Link from "next/link";
import { useDispatch } from "react-redux";
import { openModal } from "@/store/features/modalSlice";
import {
  Home,
  Search,
  Compass,
  MessageSquare,
  Heart,
  PlusSquare,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModalType } from "@/types/modal";

type MenuItem = 
  | { title: string; type: "link"; action: string; icon: any }
  | { title: string; type: "modal"; action: ModalType; icon: any };

const MENU_ITEMS: MenuItem[] = [
  { title: "Trang chủ", type: "link", action: "/", icon: Home },
  { title: "Tìm kiếm", type: "modal", action: "search_sidebar", icon: Search },
  { title: "Khám phá", type: "link", action: "/explore", icon: Compass },
  { title: "Tin nhắn", type: "link", action: "/messages", icon: MessageSquare },
  { title: "Thông báo", type: "modal", action: "notifications", icon: Heart },
  { title: "Tạo mới", type: "modal", action: "create_post", icon: PlusSquare },
];

export default function Sidebar() {
  const dispatch = useDispatch();

  const menuItemClasses =
    "flex justify-start gap-4 text-base font-semibold items-center py-3.5 px-4.5 rounded-2xl bg-transparent text-zinc-900 hover:bg-zinc-100 transition-colors w-full";

  return (
    <aside className="sticky w-65 top-6 h-[calc(100vh-48px)] bg-white rounded-3xl p-5 flex flex-col shadow-sm border border-zinc-100 z-10 mx-6">
      <Link href="/" className="mb-10 px-3 flex items-center gap-2">
        <span className="text-2xl font-bold tracking-tight text-zinc-900">
          Insta<span className="text-zinc-500">Dev</span>
        </span>
      </Link>

      <nav className="flex-1 flex flex-col gap-2">
        {MENU_ITEMS.map((item, index) => {
          const Icon = item.icon;

          if (item.type === "link") {
            return (
              <Link key={index} href={item.action} className={menuItemClasses}>
                <Icon size={24} /> {item.title}
              </Link>
            );
          }

          if (item.type === "modal") {
            return (
              <button
                key={index}
                className={menuItemClasses}
                onClick={() => dispatch(openModal(item.action))}
              >
                <Icon size={24} /> {item.title}
              </button>
            );
          }

          return null;
        })}
      </nav>

      <div className="pt-4 mt-4 border-t border-zinc-100">
        <Button
          variant="ghost"
          className="w-full flex justify-start gap-4 text-base font-semibold items-center py-6 px-4.5 rounded-2xl text-zinc-900 hover:bg-zinc-100"
        >
          <Menu size={24} /> Xem thêm
        </Button>
      </div>
    </aside>
  );
}