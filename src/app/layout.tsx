import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip"
import 'katex/dist/katex.min.css';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "3連複期待値計算ツール",
  description: "競馬の3連複購入における期待値を計算するためのツール",
};

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ja" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  )
}