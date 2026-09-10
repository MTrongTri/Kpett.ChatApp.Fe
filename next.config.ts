import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: [
      "images.unsplash.com",
      "plus.unsplash.com",
      "ui-avatars.com",
      "example.com",
      "api.dicebear.com",
      "picsum.photos",
      "res.cloudinary.com",
      "kpettapi.idct.duckdns.org",
      "localhost",
    ],
    remotePatterns: [
      { protocol: "https", hostname: "**.vnecdn.net" },
      { protocol: "https", hostname: "**.vnexpress.net" },
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "**.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
