import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Chi tiết nhóm",
  description:
    "Xem chi tiết nhóm, bài viết và thành viên trên Kpett ChatApp.",
  path: "/groups",
  noIndex: true,
});

export default function GroupDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
