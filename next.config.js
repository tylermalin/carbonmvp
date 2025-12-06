/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Note: Backend is deployed separately on Render
  // Frontend uses NEXT_PUBLIC_API_URL environment variable to call backend
  // No rewrites needed - API calls go directly to Render backend
};

module.exports = nextConfig;

