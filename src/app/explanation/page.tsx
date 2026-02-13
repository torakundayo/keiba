"use client"

import { MathExplanation } from "@/components/calculator/MathExplanation"

export default function ExplanationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 px-2 py-6 md:p-12">
      <div className="mx-auto max-w-5xl">
        <MathExplanation />
      </div>
    </div>
  )
}
