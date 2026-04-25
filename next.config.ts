import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : "";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [
          {
            protocol: "https",
            hostname: supabaseHost,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

export default withSentryConfig(nextConfig, {
  // org and project are filled in once a Sentry project exists. Without them,
  // sourcemap upload is skipped — the runtime SDK still captures errors normally.
  // org: "your-org",
  // project: "your-project",

  silent: !process.env.CI,
  widenClientFileUpload: true,
});
