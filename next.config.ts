import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin uses dynamic requires of native/optional deps (grpc etc.),
  // which break when webpack/turbopack bundles them into a serverless function.
  // Keep it external so Node resolves it at runtime like a normal dependency.
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;