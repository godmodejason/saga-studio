import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

const allowedDevOrigins = [
  "localhost:3000",
  "localhost:3001",
  "*.app.github.dev",
  "*.preview.app.github.dev",
];

const nextConfig: NextConfig = {
  ...(isDevelopment
    ? {
        allowedDevOrigins,
        experimental: {
          serverActions: {
            allowedOrigins: allowedDevOrigins,
          },
        },
      }
    : {}),
};

export default nextConfig;
