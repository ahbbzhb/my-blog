import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "@prisma/adapter-pg",
    "@prisma/driver-adapter-utils",
  ],
};

export default nextConfig;
