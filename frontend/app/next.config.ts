import { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // output: 'standalone',
  basePath: '',
  images: {
    unoptimized: true,
  },
}

export default nextConfig
