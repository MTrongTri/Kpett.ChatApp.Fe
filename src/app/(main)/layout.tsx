// import Navbar from '@/components/layout/Navbar'

import Sidebar from "@/components/layouts/side-bar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main>
        <div className="flex gap-4 py-8 max-w-337.5 mx-auto justify-between">
          <Sidebar />
          <div className="flex-1">
            {children}
          </div>
          <div className="w-65">Right</div>
        </div>
      </main>
    </>
  );
}
