import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Thiết lập tài khoản",
  description:
    "Hoàn tất thông tin cá nhân ban đầu để bắt đầu sử dụng Kpett ChatApp.",
  path: "/account-setup",
  noIndex: true,
});

export default function AccountSetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
