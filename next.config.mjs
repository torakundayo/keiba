/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  generateStaticParams: async () => {
    return {
      excludePages: ['/api/**']
    }
  }
}

export default nextConfig