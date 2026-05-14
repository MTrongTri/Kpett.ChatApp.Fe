"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bookmark,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import SuggestionsCard from "./suggestion-card";

function PanelLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2.5 flex items-center justify-between">
      <p className="text-foreground text-sm font-semibold">{children}</p>
    </div>
  );
}

const GUEST_FEATURES = [
  {
    icon: Sparkles,
    title: "Bảng tin cá nhân",
    description: "Theo dõi bài viết mới và các câu chuyện từ cộng đồng.",
  },
  {
    icon: MessageCircle,
    title: "Chat thời gian thực",
    description: "Trò chuyện riêng tư hoặc theo nhóm khi đã đăng nhập.",
  },
  {
    icon: UsersRound,
    title: "Kết nối bạn bè",
    description: "Tìm người quen, gửi lời mời và xây dựng vòng kết nối.",
  },
  {
    icon: Bookmark,
    title: "Lưu nội dung",
    description: "Đánh dấu bài viết quan trọng để xem lại sau.",
  },
];

function GuestFeatureCard() {
  return (
    <div className="border-border bg-card rounded-xl border p-4">
      <div className="space-y-4">
        {GUEST_FEATURES.map((feature) => (
          <div key={feature.title} className="flex gap-3">
            <div className="bg-primary/10 text-primary mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
              <feature.icon className="h-4 w-4" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
              <p className="text-card-foreground text-[13px] leading-tight font-semibold">
                {feature.title}
              </p>
              <p className="text-muted-foreground mt-1 text-[11.5px] leading-relaxed">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GuestSafetyCard() {
  return (
    <div className="border-border bg-card rounded-xl border p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
          <ShieldCheck className="h-4 w-4" strokeWidth={1.8} />
        </div>
        <p className="text-card-foreground text-[13px] font-semibold">
          Cộng đồng an toàn
        </p>
      </div>

      <p className="text-muted-foreground text-[12px] leading-relaxed">
        Kpet ưu tiên trải nghiệm tôn trọng, riêng tư và các kết nối lành mạnh
        giữa người dùng.
      </p>
    </div>
  );
}

function GuestProfilePreviewCard() {
  return (
    <div className="border-border bg-card rounded-xl border p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="bg-muted text-muted-foreground flex h-8 w-8 items-center justify-center rounded-lg">
          <UserRound className="h-4 w-4" strokeWidth={1.8} />
        </div>
        <p className="text-card-foreground text-[13px] font-semibold">
          Hồ sơ của riêng bạn
        </p>
      </div>

      <p className="text-muted-foreground text-[12px] leading-relaxed">
        Sau khi tạo tài khoản, bạn có thể tùy chỉnh ảnh đại diện, tiểu sử và
        trang cá nhân công khai.
      </p>

      <Link
        href="/register"
        className="text-primary mt-3 inline-flex text-[12px] font-semibold"
      >
        Tạo hồ sơ mới
      </Link>
    </div>
  );
}

function GuestRightPanel() {
  return (
    <>
      <div>
        <PanelLabel>Kpet có gì?</PanelLabel>
        <GuestFeatureCard />
      </div>

      <GuestSafetyCard />
      <GuestProfilePreviewCard />

      <p className="text-muted-foreground/50 px-1 text-[11px] leading-relaxed">
        Đăng nhập ở khung bên trái để mở gợi ý bạn bè và các hoạt động dành
        riêng cho tài khoản của bạn.
      </p>
    </>
  );
}

export default function RightPanel() {
  const { user } = useAuth();

  return (
    <aside className="sticky top-14.5 h-[calc(100vh-58px)]">
      <ScrollArea className="h-full overscroll-contain">
        <div className="max-w-75 space-y-5 px-3 py-5">
          {user ? (
            <div>
              <PanelLabel>Gợi ý bạn bè</PanelLabel>
              <SuggestionsCard />
            </div>
          ) : (
            <GuestRightPanel />
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
