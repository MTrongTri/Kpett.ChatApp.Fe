import Header from "@/components/layouts/main/header";
import BottomNav from "@/components/layouts/main/bottom-nav";
import ConnectionIndicator from "@/components/shared/connection-indicator";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="h-full mx-auto max-w-360">
      <Header />
      <ConnectionIndicator />
      <div className="pt-[58px] pb-20 md:pb-0">
        {children}
      </div>
      <BottomNav />
    </main>
  );
}
