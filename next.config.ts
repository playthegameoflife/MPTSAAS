import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // firebase-admin (+ its transitive ESM deps jose/jwks-rsa used by the Auth
  // module for ID-token verification) breaks when bundled by webpack/turbopack
  // into a serverless function. Keep them external so Node resolves at runtime.
  serverExternalPackages: [
    "firebase-admin",
    "jose",
    "jwks-rsa",
    "@google-cloud/storage",
    "@google-cloud/firestore",
    "google-auth-library",
    "gcp-metadata",
    "gaxios",
  ],
};

export default nextConfig;