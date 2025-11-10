/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // allow serving images from same origin (public/uploads)
    domains: [],
  },
};

module.exports = nextConfig;
