/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['lh3.googleusercontent.com', 'images.nasa.gov'],
  },
  env: {
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
    NASA_API_KEY: process.env.NASA_API_KEY,
    GOOGLE_OAUTH_CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID,
    GOOGLE_OAUTH_SECRET: process.env.GOOGLE_OAUTH_SECRET,
  },
}

module.exports = nextConfig
