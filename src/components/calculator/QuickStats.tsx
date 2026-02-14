import type { CalculationResult } from '@/lib/calculator/types'

type QuickStatsProps = {
  results: CalculationResult
}

export function QuickStats({ results }: QuickStatsProps) {
  const recommendedCount = results.combinations.filter(c => c.tier === 'recommended').length
  const promisingCount = results.combinations.filter(c => c.tier === 'promising').length
  const realisticRecommended = results.combinations.filter(
    c => c.tier === 'recommended' && c.probability >= 0.001
  ).length

  return (
    <div className="py-3 border-b border-slate-100 space-y-2">
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
        <span>
          推奨: <strong className="text-slate-800">{recommendedCount}</strong>
          {promisingCount > 0 && (
            <span className="text-slate-400 text-xs ml-1">+ 有望 {promisingCount}</span>
          )}
          <span className="text-slate-400"> / {results.combinations.length}通り</span>
          {realisticRecommended < recommendedCount && (
            <span className="text-slate-400 text-xs ml-1">(現実的: {realisticRecommended})</span>
          )}
        </span>
        <span>
          掛け金合計: <strong className="text-slate-800 tabular-nums">
            {Math.round(results.totalStakes).toLocaleString()}円
          </strong>
        </span>
      </div>
      <p className="text-xs text-slate-400">
        推奨の中から、自分の予想に合う組み合わせを選んで購入を検討してください。確率が極端に低い組み合わせは薄く表示されます。
      </p>
    </div>
  )
}
