/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure Turbopack can resolve the Next.js package from the project root
  turbopack: {
    root: __dirname,
  },
  // Enable strict mode and SWC minification
  reactStrictMode: true,
  swcMinify: true,
  // Optional: customize output directory for Cloudflare Pages
  output: "standalone",
};

module.exports = nextConfig;
