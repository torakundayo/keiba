# 競馬3連複期待値計算ツール

競馬の3連複購入における期待値を計算するためのWebアプリケーションです。

## 機能

- 出走頭数に基づく組み合わせ計算
- 除外馬の選択機能
- 確信度に基づく期待値計算
- リアルタイムな結果表示

## 技術スタック

- Next.js 14
- TypeScript
- Tailwind CSS
- shadcn/ui

## 開発環境のセットアップ

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Renderへのデプロイ

1. GitHubにリポジトリをプッシュ
2. Renderアカウントを作成
3. "New +" > "Web Service"を選択
4. GitHubリポジトリを連携
5. 以下の設定を入力：
   - Name: horse-racing-calculator
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
6. "Create Web Service"をクリック

デプロイが完了すると、提供されたURLでアプリケーションにアクセスできます。
