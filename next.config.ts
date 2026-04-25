import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  // org and project are filled in once a Sentry project exists. Without them,
  // sourcemap upload is skipped — the runtime SDK still captures errors normally.
  // org: "your-org",
  // project: "your-project",

  silent: !process.env.CI,
  widenClientFileUpload: true,
});
