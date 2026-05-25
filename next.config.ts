import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
  serverExternalPackages: ["bcryptjs"],
  experimental: {
    serverActions: { bodySizeLimit: "100mb" },
  },
};

export default nextConfig;
