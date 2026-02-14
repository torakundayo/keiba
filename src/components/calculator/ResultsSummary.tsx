"use client"

import { useMemo } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import type { CalculationResult } from '@/lib/calculator/types'

type ResultsSummaryProps = {
  results: CalculationResult
}

export function ResultsSummary({ results }: ResultsSummaryProps) {
  const overallEV = results.weightedReturn / results.totalStakes

  const recommendedStats = useMemo(() => {
    const recommended = results.combinations.filter(c => c.tier === 'recommended')
    if (recommended.length === 0) return null

    const totalStakes = recommended.reduce((sum, c) => sum + c.stake, 0)
    const weightedReturn = recommended.reduce((sum, c) => sum + c.stake * c.approximateOdds * c.probability, 0)
    const ev = weightedReturn / totalStakes

    return { count: recommended.length, totalStakes, ev }
  }, [results.combinations])

  return (
    <div className="space-y-5">
      {/* Top-level stats */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* All combinations */}
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-5 space-y-2">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">全組合せ</p>
          <p className="text-sm text-slate-600">
            総組合せ数: <span className="font-bold text-slate-800 tabular-nums">{results.combinations.length}</span> 通り
          </p>
          <p className="text-sm text-slate-600">
            総掛け金: <span className="font-bold text-slate-800 tabular-nums">{Math.round(results.totalStakes).toLocaleString()}</span> 円
            <span className="text-[10px] text-slate-400 ml-1">（100円×{results.combinations.length}通り）</span>
          </p>
          <p className="text-sm text-slate-600">
            回収率: <span className={`font-bold tabular-nums text-lg ${overallEV >= 1.0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {Math.round(overallEV * 100)}%
            </span>
          </p>
        </div>

        {/* Recommended combinations */}
        <div className="rounded-xl bg-emerald-50/50 border border-emerald-100/80 p-5 space-y-2">
          <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest mb-3">推奨組合せ</p>
          {recommendedStats ? (
            <>
              <p className="text-sm text-slate-600">
                組合せ数: <span className="font-bold text-emerald-700 tabular-nums">{recommendedStats.count}</span>
                <span className="text-slate-400"> / {results.combinations.length} 通り</span>
              </p>
              <p className="text-sm text-slate-600">
                総掛け金: <span className="font-bold text-slate-800 tabular-nums">{Math.round(recommendedStats.totalStakes).toLocaleString()}</span> 円
              </p>
              <p className="text-sm text-slate-600">
                回収率: <span className={`font-bold tabular-nums text-lg ${recommendedStats.ev >= 1.0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {Math.round(recommendedStats.ev * 100)}%
                </span>
              </p>
            </>
          ) : (
            <p className="text-sm text-slate-400">推奨組合せはありません</p>
          )}
        </div>
      </div>

      {/* Best / Worst EV */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex items-start gap-3 rounded-xl border border-slate-100 p-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 shrink-0">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-600 mb-1">最高回収率</p>
            <p className="font-bold text-slate-800 tabular-nums">{Math.round(results.bestEV.value * 100)}%</p>
            <p className="text-xs text-slate-400 tabular-nums">
              {results.bestEV.horses.join('-')} (オッズ: {results.bestEV.odds.toFixed(1)})
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3 rounded-xl border border-slate-100 p-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 shrink-0">
            <TrendingDown className="h-4 w-4 text-rose-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-rose-500 mb-1">最低回収率</p>
            <p className="font-bold text-slate-800 tabular-nums">{Math.round(results.worstEV.value * 100)}%</p>
            <p className="text-xs text-slate-400 tabular-nums">
              {results.worstEV.horses.join('-')} (オッズ: {results.worstEV.odds.toFixed(1)})
            </p>
          </div>
        </div>
      </div>

      {/* Tier legend */}
      <div className="rounded-xl bg-slate-50 border border-slate-100 p-5">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">推奨度の判定基準</p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 font-semibold text-[11px]">推奨</span>
            <span className="text-slate-500">的中確率が高く、割安な組合せ</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="inline-block px-2.5 py-1 rounded-md bg-sky-100 text-sky-700 font-semibold text-[11px]">堅実</span>
            <span className="text-slate-500">的中確率は高いが、割高な組合せ</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="inline-block px-2.5 py-1 rounded-md bg-amber-100 text-amber-700 font-semibold text-[11px]">穴狙い</span>
            <span className="text-slate-500">的中確率は低いが、割安な組合せ</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 font-semibold text-[11px]">非推奨</span>
            <span className="text-slate-500">的中確率が低く、割高な組合せ</span>
          </div>
        </div>
      </div>
    </div>
  )
}
