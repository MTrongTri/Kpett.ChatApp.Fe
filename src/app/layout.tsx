import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Roboto, IBM_Plex_Mono } from "next/font/google";
import Script from "next/script";

const roboto = Roboto({
  weight: ["400", "500", "700", "900"],
  subsets: ["latin", "vietnamese"],
  display: "swap",
  variable: "--font-roboto",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

import { Toaster } from "sonner";
import { AuthProvider } from "@/components/providers/auth-provider";
import { GlobalModalProvider } from "@/components/providers/global-modal-provider";
import QueryProvider from "@/components/providers/query-provider";
import { SignalRProvider } from "@/components/providers/signalr-provider";
import { StoreProvider } from "@/components/providers/store-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { defaultMetadata, searchStructuredData } from "@/lib/seo";
import "./globals.css";

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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${roboto.variable} ${ibmPlexMono.variable} bg-background`}>
      <head>
        <Script
          id="theme-initializer"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: themeInitializerScript,
          }}
        />
      </head>
      <body className="bg-background font-roboto text-foreground antialiased">
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
                  <Toaster richColors position="top-center" />
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
