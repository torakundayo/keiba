/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'katex$': 'katex/dist/katex.mjs',
    }
    return config
  }
}

export default nextConfig
