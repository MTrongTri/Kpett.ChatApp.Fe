import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Đã lưu",
  description: "Xem lại các nội dung đã lưu trong tài khoản Kpett ChatApp.",
  path: "/saved",
  noIndex: true,
});

export default function SavedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
