/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... 他の設定
  reactStrictMode: true,
  // Renderでのデプロイ用の設定
  experimental: {
    // サーバーコンポーネントを無効化
    appDir: true,
    serverActions: true,
  },
}

module.exports = nextConfig