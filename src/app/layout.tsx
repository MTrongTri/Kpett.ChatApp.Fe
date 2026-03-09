import { Toaster } from "sonner";
import "./globals.css";
import { StoreProvider } from "@/components/providers/store-provider";
import { ModalProvider } from "@/components/modals/modal-provider";
import { IBM_Plex_Mono, Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

// Cấu hình Mono (nếu muốn)
const ibmMono = IBM_Plex_Mono({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={`${roboto.variable} ${ibmMono.variable} font-roboto`}>
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
