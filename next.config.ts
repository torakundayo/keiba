import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config: any) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'katex': 'katex/dist/katex.mjs',
    }
    return config
  }
}

export default nextConfig;