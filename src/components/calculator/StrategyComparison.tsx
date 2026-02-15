"use client"

import { useMemo } from 'react'
import type { CombinationResult } from '@/lib/calculator/types'

type StrategyComparisonProps = {
  combinations: CombinationResult[]
}

// バックテスト実績（774レース, 2025/11 - 2026/02）
const BACKTEST_DATA: Record<number, { hitRate: number; roi: number }> = {
  3: { hitRate: 0.213, roi: -0.546 },
  5: { hitRate: 0.286, roi: -0.593 },
  10: { hitRate: 0.391, roi: -0.673 },
  20: { hitRate: 0.561, roi: -0.691 },
}

type Strategy = {
  label: string
  n: number
  combos: CombinationResult[]
}

function calcStats(combos: CombinationResult[]) {
  if (combos.length === 0) return null
  const count = combos.length
  const cost = count * 100
  const hitRate = combos.reduce((sum, c) => sum + c.probability, 0)
  const expectedReturn = combos.reduce((sum, c) => sum + c.probability * c.expectedReturn, 0)
  const ev = cost > 0 ? (expectedReturn / cost) * 100 : 0
  return { count, cost, hitRate, ev }
}

export function StrategyComparison({ combinations }: StrategyComparisonProps) {
  const strategies = useMemo<Strategy[]>(() => {
    return [
      { label: 'Top 3', n: 3, combos: combinations.filter(c => c.rank <= 3) },
      { label: 'Top 5', n: 5, combos: combinations.filter(c => c.rank <= 5) },
      { label: 'Top 10', n: 10, combos: combinations.filter(c => c.rank <= 10) },
      { label: 'Top 20', n: 20, combos: combinations.filter(c => c.rank <= 20) },
    ]
  }, [combinations])

  const rows = strategies.map(s => ({
    label: s.label,
    n: s.n,
    stats: calcStats(s.combos),
  }))

  if (rows.every(r => !r.stats)) return null

  return (
    <div className="py-4 border-b border-slate-100">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-400">
              <th className="text-left font-medium py-1.5 pr-2">買い方</th>
              <th className="text-right font-medium py-1.5 px-2">点数</th>
              <th className="text-right font-medium py-1.5 px-2">投資額</th>
              <th className="text-right font-medium py-1.5 px-2">モデル的中率</th>
              <th className="text-right font-medium py-1.5 px-2">モデル回収率</th>
              <th className="text-right font-medium py-1.5 px-2">実績的中率</th>
              <th className="text-right font-medium py-1.5 pl-2">実績回収率</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              if (!row.stats) {
                return (
                  <tr key={row.label} className="border-t border-slate-50">
                    <td className="py-2 pr-2 text-slate-700">{row.label}</td>
                    <td colSpan={6} className="py-2 text-right text-slate-300 text-xs">該当なし</td>
                  </tr>
                )
              }
              const { count, cost, hitRate, ev } = row.stats
              const backtest = BACKTEST_DATA[row.n]
              return (
                <tr key={row.label} className="border-t border-slate-50">
                  <td className="py-2 pr-2 text-slate-700 font-medium">{row.label}</td>
                  <td className="py-2 px-2 text-right tabular-nums text-slate-600">{count}</td>
                  <td className="py-2 px-2 text-right tabular-nums text-slate-600">{cost.toLocaleString()}円</td>
                  <td className="py-2 px-2 text-right tabular-nums text-slate-600">{(hitRate * 100).toFixed(1)}%</td>
                  <td className={`py-2 px-2 text-right tabular-nums font-medium ${
                    ev >= 100 ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {ev.toFixed(0)}%
                  </td>
                  <td className="py-2 px-2 text-right tabular-nums text-slate-500 text-xs">
                    {backtest ? `${(backtest.hitRate * 100).toFixed(1)}%` : '-'}
                  </td>
                  <td className={`py-2 pl-2 text-right tabular-nums text-xs ${
                    backtest && backtest.roi >= 0 ? 'text-emerald-600' : 'text-rose-500'
                  }`}>
                    {backtest ? `${((1 + backtest.roi) * 100).toFixed(0)}%` : '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] text-slate-400 mt-2">
        実績値は過去774レースのバックテスト結果（確率順Top-N購入時）
      </p>
    </div>
  )
}
