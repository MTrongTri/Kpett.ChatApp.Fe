import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Cuộc trò chuyện",
  description: "Trao đổi tin nhắn riêng tư trên Kpett ChatApp.",
  path: "/chat",
  noIndex: true,
});

export default function ChatConversationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
