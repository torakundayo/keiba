import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";
import "./globals.css";
import 'katex/dist/katex.min.css';
import { Providers } from "@/components/Providers";
import { Toaster } from "@/components/ui/toaster"
import { Navigation } from "@/components/Navigation"

const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-sans",
  display: "swap",
});

const notoSerif = Noto_Serif_JP({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "3連複 確率構造分析",
  description: "単勝・複勝オッズから3連複の的中確率を推定し、確率構造を可視化するツール",
};

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja" className={`${notoSans.variable} ${notoSerif.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <Navigation />
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}
