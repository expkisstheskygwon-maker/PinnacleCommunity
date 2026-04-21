/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure Turbopack can resolve the Next.js package from the project root
  turbopack: {
    root: __dirname,
  },
  // Enable strict mode and SWC minification
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
