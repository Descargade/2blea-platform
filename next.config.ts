import type { NextConfig } from "next";

const isVercel = process.env.VERCEL === "1";

const nextConfig: NextConfig = {
  output: !isVercel && process.env.NODE_ENV === "production" ? "standalone" : undefined,
  serverExternalPackages: ["bcryptjs"],
  experimental: {
    serverActions: { bodySizeLimit: "100mb" },
  },
};

export default nextConfig;
