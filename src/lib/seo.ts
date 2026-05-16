import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

function getSiteUrl(url: string) {
  try {
    return new URL(url).toString();
  } catch {
    return "http://localhost:3000";
  }
}

export const siteConfig = {
  name: "Kpet",
  fullName: "Kpet ChatApp",
  alternateNames: ["Kpett ChatApp", "Kpet Chat"],
  url: getSiteUrl(siteUrl),
  favicon: "/favicon.ico",
  icon: "/icon.png",
  logo: "/logo.png",
  ogImage: "/og-img.png",
  description:
    "Kpet ChatApp là mạng xã hội giúp bạn chia sẻ bài viết, trò chuyện và kết nối với bạn bè theo thời gian thực.",
  locale: "vi_VN",
};

function absoluteUrl(path: string) {
  return new URL(path, siteConfig.url).toString();
}

const defaultKeywords = [
  "Kpet",
  "Kpet ChatApp",
  "mạng xã hội",
  "chat",
  "nhắn tin",
  "bạn bè",
  "bài viết",
];

const publicRobots: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

const privateRobots: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
};

type SeoImage = NonNullable<NonNullable<Metadata["openGraph"]>["images"]>;

type PageMetadataOptions = {
  title: string;
  description?: string;
  path?: string;
  images?: SeoImage;
  noIndex?: boolean;
};

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  applicationName: siteConfig.fullName,
  appleWebApp: {
    title: siteConfig.name,
  },
  title: {
    default: siteConfig.fullName,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: defaultKeywords,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      {
        url: siteConfig.favicon,
        sizes: "32x32",
        type: "image/x-icon",
      },
      {
        url: siteConfig.icon,
        sizes: "192x192",
        type: "image/png",
      },
    ],
    shortcut: siteConfig.favicon,
    apple: [
      {
        url: siteConfig.icon,
        sizes: "192x192",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    title: siteConfig.fullName,
    siteName: siteConfig.name,
    description: siteConfig.description,
    url: "/",
    images: [
      {
        url: siteConfig.ogImage,
        width: 1731,
        height: 909,
        alt: siteConfig.fullName,
      }
    ],
    locale: siteConfig.locale,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.fullName,
    description: siteConfig.description,
  },
  robots: publicRobots,
};

export const searchStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": absoluteUrl("#website"),
      name: siteConfig.name,
      alternateName: [siteConfig.fullName, ...siteConfig.alternateNames],
      url: siteConfig.url,
      inLanguage: "vi-VN",
    },
    {
      "@type": "Organization",
      "@id": absoluteUrl("#organization"),
      name: siteConfig.name,
      alternateName: [siteConfig.fullName, ...siteConfig.alternateNames],
      url: siteConfig.url,
      logo: absoluteUrl(siteConfig.logo),
      image: absoluteUrl(siteConfig.logo),
    },
  ],
};

export function createPageMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  images,
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const fullTitle = `${title} · ${siteConfig.name}`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
      images: images || defaultMetadata.openGraph?.images,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images,
    },
    robots: noIndex ? privateRobots : publicRobots,
  };
}
