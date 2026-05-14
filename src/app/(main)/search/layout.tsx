import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Tìm kiếm",
  description:
    "Tìm kiếm bạn bè, hồ sơ và nội dung trong cộng đồng Kpett ChatApp.",
  path: "/search",
  noIndex: true,
});

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
