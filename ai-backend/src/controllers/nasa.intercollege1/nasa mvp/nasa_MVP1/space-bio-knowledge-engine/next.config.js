/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: { allowedOrigins: ['localhost:3000'] },
  },
  images: {
    domains: ['images-assets.nasa.gov', 'www.nasa.gov'],
  },
};

module.exports = nextConfig;
