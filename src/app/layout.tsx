import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { SignalRProvider } from "@/components/providers/signalr-provider";
import { StoreProvider } from "@/components/providers/store-provider";
import { IBM_Plex_Mono, Roboto } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { GlobalModalProvider } from "@/components/providers/global-modal-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import QueryProvider from "@/components/providers/query-provider";
import { defaultMetadata } from "@/lib/seo";

const roboto = Roboto({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

// Cấu hình Mono
const ibmMono = IBM_Plex_Mono({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata = defaultMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${roboto.variable} ${ibmMono.variable} font-roboto bg-background`}
      >
        <StoreProvider>
          <AuthProvider>
            <SignalRProvider>
              <QueryProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                >
                  {children}

                  {/* Toast */}
                  <Toaster richColors position="top-center" />

                  {/* Modals */}
                  <GlobalModalProvider />
                </ThemeProvider>
              </QueryProvider>
            </SignalRProvider>
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
