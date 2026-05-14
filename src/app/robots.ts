import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const host = new URL(siteConfig.url).origin;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/account/",
        "/account-setup",
        "/chat/",
        "/friends",
        "/reels",
        "/saved",
        "/search",
      ],
    },
    host,
  };
}
