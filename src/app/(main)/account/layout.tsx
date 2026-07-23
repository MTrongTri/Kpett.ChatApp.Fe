import { ReactNode } from "react";
import Sidebar from "./components/side-bar";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Cài đặt tài khoản",
  description:
    "Cập nhật hồ sơ, quyền riêng tư và cài đặt tài khoản Kpett ChatApp.",
  path: "/account/general",
  noIndex: true,
});

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background text-foreground mt-14.5 min-h-screen pb-20 font-roboto">
      <div className="mx-auto max-w-6xl px-5 pt-8 pb-6">
        {/* Tiêu đề trang */}
        <div className="mb-7">
          <h1 className="text-foreground text-[28px] font-bold tracking-tight">
            Chỉnh sửa trang cá nhân
          </h1>
          <p className="text-muted-foreground mt-1 text-xs">
            Thay đổi sẽ được hiển thị công khai trên trang của bạn
          </p>
        </div>

        <div className="relative flex flex-col items-start gap-5 lg:flex-row">
          {/* Sidebar Menu */}
          <Sidebar />

          {/* Cột Nội dung chính */}
          <div className="flex w-full min-w-0 flex-1 flex-col gap-6">
            {/* Khung chứa các Form (Tab Edit, Account...) */}
            <div className="md:border-border md:bg-card rounded-xl md:border md:p-6 shadow-sm">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
