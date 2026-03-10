// import Navbar from '@/components/layout/Navbar'

import Header from "@/components/layouts/main/header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <main className="max-w-[1440px] mx-auto">
        <Header />
        {children}
      </main>
  );
}
