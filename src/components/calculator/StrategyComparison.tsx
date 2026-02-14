"use client"

import { useMemo } from 'react'
import type { CombinationResult } from '@/lib/calculator/types'

type StrategyComparisonProps = {
  combinations: CombinationResult[]
}

type Strategy = {
  label: string
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
    const recommended = combinations.filter(c => c.tier === 'recommended')
    const promising = combinations.filter(c => c.tier === 'promising')
    return [
      { label: '推奨のみ', combos: recommended },
      { label: '推奨＋有望', combos: [...recommended, ...promising] },
      { label: '有望のみ', combos: promising },
    ]
  }, [combinations])

  const rows = strategies.map(s => ({ label: s.label, stats: calcStats(s.combos) }))

  // Don't render if no recommended or promising combinations exist
  if (rows.every(r => !r.stats)) return null

  return (
    <div className="py-4 border-b border-slate-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-slate-400">
            <th className="text-left font-medium py-1.5 pr-2">買い方</th>
            <th className="text-right font-medium py-1.5 px-2">点数</th>
            <th className="text-right font-medium py-1.5 px-2">投資額</th>
            <th className="text-right font-medium py-1.5 px-2">的中率</th>
            <th className="text-right font-medium py-1.5 pl-2">期待回収率</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            if (!row.stats) {
              return (
                <tr key={row.label} className="border-t border-slate-50">
                  <td className="py-2 pr-2 text-slate-700">{row.label}</td>
                  <td colSpan={4} className="py-2 text-right text-slate-300 text-xs">該当なし</td>
                </tr>
              )
            }
            const { count, cost, hitRate, ev } = row.stats
            return (
              <tr key={row.label} className="border-t border-slate-50">
                <td className="py-2 pr-2 text-slate-700">{row.label}</td>
                <td className="py-2 px-2 text-right tabular-nums text-slate-600">{count}</td>
                <td className="py-2 px-2 text-right tabular-nums text-slate-600">{cost.toLocaleString()}円</td>
                <td className="py-2 px-2 text-right tabular-nums text-slate-600">{(hitRate * 100).toFixed(1)}%</td>
                <td className={`py-2 pl-2 text-right tabular-nums font-medium ${
                  ev >= 100 ? 'text-emerald-600' : 'text-slate-400'
                }`}>
                  {ev.toFixed(0)}%
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
