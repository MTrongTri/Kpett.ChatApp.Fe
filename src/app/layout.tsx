import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { SignalRProvider } from "@/components/providers/signalr-provider";
import { StoreProvider } from "@/components/providers/store-provider";
import { IBM_Plex_Mono, Roboto } from "next/font/google";
import Script from "next/script";
import { Toaster } from "sonner";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { GlobalModalProvider } from "@/components/providers/global-modal-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import QueryProvider from "@/components/providers/query-provider";
import { defaultMetadata, searchStructuredData } from "@/lib/seo";

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

const searchStructuredDataScript = JSON.stringify(searchStructuredData).replace(
  /</g,
  "\\u003c",
);

const themeInitializerScript = `
  (function () {
    try {
      var theme = localStorage.getItem("theme");
      var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      var resolvedTheme = theme === "dark" || ((theme === "system" || !theme) && prefersDark) ? "dark" : "light";
      var root = document.documentElement;

      root.classList.remove("light", "dark");
      root.classList.add(resolvedTheme);
      root.style.colorScheme = resolvedTheme;
    } catch (_) {}
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="vi"
      suppressHydrationWarning
      className={`${roboto.variable} ${ibmMono.variable} bg-background`}
    >
      <head>
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: themeInitializerScript,
          }}
        />
      </head>
      <body
        className="min-h-screen bg-background font-roboto text-foreground antialiased"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: searchStructuredDataScript }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StoreProvider>
            <AuthProvider>
              <SignalRProvider>
                <QueryProvider>

                  {children}

                  {/* Toast */}
                  <Toaster richColors position="top-center" />

                  {/* Modals */}
                  <GlobalModalProvider />
                </QueryProvider>
              </SignalRProvider>
            </AuthProvider>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
