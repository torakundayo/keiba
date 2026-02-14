"use client"

import { MathExplanation } from "@/components/calculator/MathExplanation"

export default function ExplanationPage() {
  return (
    <div className="min-h-screen mesh-bg px-3 py-8 md:p-12">
      <div className="mx-auto max-w-5xl">
        <MathExplanation />
      </div>
    </div>
  )
}
