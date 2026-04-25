import type { MetadataRoute } from "next";

const FALLBACK_BASE_URL = "https://hotel-booking-beta-six.vercel.app";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? FALLBACK_BASE_URL;
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account/", "/admin/", "/api/", "/book"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
