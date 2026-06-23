import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Nhóm",
  description:
    "Khám phá và quản lý nhóm cộng đồng trên Kpett ChatApp.",
  path: "/groups",
  noIndex: true,
});

export default function GroupsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
