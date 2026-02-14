"use client"

import { MathExplanation } from "@/components/calculator/MathExplanation"

export default function ExplanationPage() {
  return (
    <div className="min-h-screen px-4 py-8 md:px-12 md:py-12">
      <div className="mx-auto max-w-3xl">
        <MathExplanation />
      </div>
    </div>
  )
}
