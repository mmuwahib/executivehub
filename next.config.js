/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Local dev only: Azure Static Web Apps normally routes /api/* to the
  // Functions host itself. Plain `next dev` doesn't, so proxy to a locally
  // running `func start` (default port 7071) for local testing.
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];
    return [{ source: "/api/:path*", destination: "http://localhost:7071/api/:path*" }];
  },
};

module.exports = nextConfig;
