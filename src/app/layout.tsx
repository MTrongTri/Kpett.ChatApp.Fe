import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { SignalRProvider } from "@/components/providers/signalr-provider";
import { StoreProvider } from "@/components/providers/store-provider";
import { IBM_Plex_Mono, Roboto } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";

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
      <body
        className={`${roboto.variable} ${ibmMono.variable} font-roboto bg-background`}
      >
        <StoreProvider>
          <AuthProvider>
            <SignalRProvider>
              {children}
              {/* Toast */}
              <Toaster richColors position="top-center" />
              {/* Modals */}
            </SignalRProvider>

          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
