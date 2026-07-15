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
  },
};

export default nextConfig;
