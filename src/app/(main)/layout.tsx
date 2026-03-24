// import Navbar from '@/components/layout/Navbar'

import Header from "@/components/layouts/main/header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-360">
      <Header />
      {children}
    </main>
  );
}
