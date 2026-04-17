// app/(main)/[username]/(settings)/layout.tsx

import { ReactNode } from "react";
import Sidebar from "./_components/side-bar";
import TopNav from "./_components/top-nav";

export default async function SettingsLayout({
    children,
    params,
}: {
    children: ReactNode;
    params: Promise<{ username: string }>;
}) {
    const { username } = await params;

    return (
        <div className="min-h-screen bg-background text-foreground font-sans pb-20">

            {/* Header Navbar */}
            <TopNav username={username} />

            <div className="px-5 pt-8 pb-6 max-w-6xl mx-auto">
                {/* Tiêu đề trang */}
                <div className="mb-7">
                    <h1 className="text-[28px] font-bold text-foreground tracking-tight">
                        Chỉnh sửa trang cá nhân
                    </h1>
                    <p className="text-[12px] text-foreground/40 mt-1">
                        Thay đổi sẽ được hiển thị công khai trên trang của bạn
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-5 items-start relative">
                    {/* Sidebar Menu */}
                    <Sidebar username={username} />

                    {/* Cột Nội dung chính */}
                    <div className="flex-1 min-w-0 flex flex-col gap-6 w-full">

                        {/* Khung chứa các Form (Tab Edit, Account...) */}
                        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                            {children}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}