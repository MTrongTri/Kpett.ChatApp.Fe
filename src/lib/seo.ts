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
  name: "Kpett",
  fullName: "Kpett ChatApp",
  url: getSiteUrl(siteUrl),
  description:
    "Kpett ChatApp là mạng xã hội giúp bạn chia sẻ bài viết, trò chuyện và kết nối với bạn bè theo thời gian thực.",
  locale: "vi_VN",
};

const defaultKeywords = [
  "Kpett",
  "Kpett ChatApp",
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
  openGraph: {
    title: siteConfig.fullName,
    description: siteConfig.description,
    url: "/",
    images: [
      {
        url: `/kpet.png`,
        width: 1200,
        height: 630,
      }
    ],
    siteName: siteConfig.name,
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
