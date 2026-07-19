/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.cloudflareimages.com' },
    ],
  },
}

module.exports = nextConfig
