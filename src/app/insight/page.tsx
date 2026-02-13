"use client"

import { InsightCard } from "@/components/calculator/InsightCard"

export default function InsightPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 px-2 py-6 md:p-12">
      <div className="mx-auto max-w-5xl">
        <InsightCard />
      </div>
    </div>
  )
}
