import type { MetadataRoute } from "next";

import { createClient } from "@/lib/supabase/server";

const FALLBACK_BASE_URL = "https://hotel-booking-beta-six.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? FALLBACK_BASE_URL;
  const supabase = await createClient();

  const { data: rooms } = await supabase
    .from("room_types")
    .select("slug, updated_at")
    .eq("is_active", true);

  const now = new Date();

  return [
    { url: baseUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/rooms`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...(rooms ?? []).map((r) => ({
      url: `${baseUrl}/rooms/${r.slug}`,
      lastModified: new Date(r.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
