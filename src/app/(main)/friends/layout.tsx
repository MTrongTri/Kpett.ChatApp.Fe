import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Bạn bè",
  description:
    "Quản lý danh sách bạn bè và lời mời kết nối trên Kpett ChatApp.",
  path: "/friends",
  noIndex: true,
});

export default function FriendsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
