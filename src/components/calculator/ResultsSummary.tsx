"use client"

import type { CalculationResult } from '@/lib/calculator/types'

type ResultsSummaryProps = {
  results: CalculationResult
}

export function ResultsSummary({ results }: ResultsSummaryProps) {
  return (
    <div className="rounded-xl border p-6 space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <p className="text-sm md:text-base">
            総組合せ数: <span className="text-base md:text-base font-bold">{results.combinations.length}</span> 通り
          </p>
          <p className="text-sm md:text-base">
            総掛け金: <span className="text-base md:text-base font-bold">{Math.round(results.totalStakes).toLocaleString()}</span> 円
          </p>
          <p className="text-sm md:text-base">
            難易度加重期待リターン: <span className="text-base md:text-base font-bold">{Math.round(results.weightedReturn).toLocaleString()}</span> 円
          </p>
          <p className="text-sm md:text-base">
            期待値: <span className="text-base md:text-base font-bold">{(results.weightedReturn / results.totalStakes).toFixed(2)}</span>
          </p>
        </div>
        <div className="space-y-2">
          <div>
            <p className="text-sm text-blue-600">最小期待リターン:</p>
            <p className="font-bold">{Math.round(results.minReturn.value).toLocaleString()}円</p>
            <p className="text-sm text-gray-600">
              組合せ: {results.minReturn.horses.join('-')} (オッズ: {results.minReturn.odds.toFixed(1)})
            </p>
          </div>
          <div>
            <p className="text-sm text-blue-600">最大期待リターン:</p>
            <p className="font-bold">{Math.round(results.maxReturn.value).toLocaleString()}円</p>
            <p className="text-sm text-gray-600">
              組合せ: {results.maxReturn.horses.join('-')} (オッズ: {results.maxReturn.odds.toFixed(1)})
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
