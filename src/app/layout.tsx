import { Toaster } from "sonner";
import "./globals.css";
import Sidebar from "@/components/layouts/side-bar";
import { StoreProvider } from "@/components/providers/store-provider";
import { ModalProvider } from "@/components/modals/modal-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <StoreProvider>
          {children}
          {/* Toast */}
          <Toaster richColors position="top-center" />
          {/* Modals */}
          <ModalProvider />
        </StoreProvider>
      </body>
    </html>
  );
}
