"use client"

import { ChevronUp, ChevronDown } from 'lucide-react'
import type { CombinationResult, SortConfig } from '@/lib/calculator/types'
import { RESULTS_PER_PAGE } from '@/lib/calculator/types'

const TIER_LABELS = {
  recommended: { text: '推奨', className: 'bg-emerald-100 text-emerald-700' },
  promising: { text: '有望', className: 'bg-teal-100 text-teal-700' },
  solid: { text: '堅実', className: 'bg-sky-100 text-sky-700' },
  longshot: { text: '穴狙い', className: 'bg-amber-100 text-amber-700' },
  avoid: { text: '非推奨', className: 'bg-slate-100 text-slate-500' },
} as const

type ResultsTableProps = {
  sortedCombinations: CombinationResult[]
  sortConfig: SortConfig
  showAllResults: boolean
  resultsRef: React.RefObject<HTMLDivElement>
  onSort: (key: keyof CombinationResult) => void
  onSetShowAll: (show: boolean) => void
}

export function ResultsTable({
  sortedCombinations,
  sortConfig,
  showAllResults,
  onSort,
}: ResultsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            {[
              { key: 'horses', label: '組合せ' },
              { key: 'tier', label: '推奨度' },
              { key: 'ev', label: '期待回収率' },
              { key: 'probability', label: '確率' },
              { key: 'approximateOdds', label: '予想オッズ' },
            ].map(({ key, label }) => (
              <th
                key={key}
                onClick={() => onSort(key as keyof CombinationResult)}
                className={`
                  cursor-pointer p-2.5 text-xs text-slate-400
                  hover:text-slate-600 transition-colors
                  ${key === 'horses' || key === 'tier' ? 'text-left' : 'text-right'}
                `}
              >
                <div className={`flex items-center gap-1 ${key === 'horses' || key === 'tier' ? 'justify-start' : 'justify-end'}`}>
                  {label}
                  {sortConfig?.key === key && (
                    <span className="text-slate-600">
                      {sortConfig.direction === 'asc'
                        ? <ChevronUp className="h-3 w-3" />
                        : <ChevronDown className="h-3 w-3" />
                      }
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedCombinations
            .slice(0, showAllResults ? undefined : RESULTS_PER_PAGE.desktop)
            .map((combo, index) => {
              const tierInfo = TIER_LABELS[combo.tier]
              return (
                <tr key={index} className={`border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                  (combo.tier === 'recommended' || combo.tier === 'promising') && combo.probability < 0.001 ? 'opacity-50' : ''
                }`}>
                  <td className="text-left p-2.5 text-sm font-medium text-slate-700 tabular-nums">
                    {combo.horses.join('-')}
                  </td>
                  <td className="p-2.5">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold ${tierInfo.className}`}>
                      {tierInfo.text}
                    </span>
                  </td>
                  <td className={`text-right p-2.5 text-sm font-bold tabular-nums ${
                    combo.ev >= 1.0 ? 'text-emerald-700' : 'text-rose-600'
                  }`}>
                    {Math.round(combo.ev * 100)}%
                  </td>
                  <td className={`text-right p-2.5 text-sm tabular-nums ${
                    combo.probability >= 0.005 ? 'text-slate-800 font-medium' :
                    combo.probability >= 0.001 ? 'text-slate-600' :
                    'text-slate-400'
                  }`}>
                    {(combo.probability * 100).toFixed(2)}%
                  </td>
                  <td className="text-right p-2.5 text-sm tabular-nums text-slate-600">
                    {combo.approximateOdds.toFixed(1)}
                  </td>
                </tr>
              )
            })}
        </tbody>
      </table>
    </div>
  )
}
