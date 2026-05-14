import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Reels",
  description: "Khám phá nội dung video ngắn trong cộng đồng Kpett ChatApp.",
  path: "/reels",
  noIndex: true,
});

export default function ReelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
