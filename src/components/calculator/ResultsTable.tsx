"use client"

import { ChevronUp, ChevronDown } from 'lucide-react'
import type { CombinationResult, SortConfig } from '@/lib/calculator/types'
import { RESULTS_PER_PAGE } from '@/lib/calculator/types'

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
              { key: 'rank', label: '順位', align: 'center' },
              { key: 'horses', label: '組合せ', align: 'left' },
              { key: 'probability', label: '確率', align: 'right' },
              { key: 'ev', label: '期待回収率', align: 'right' },
              { key: 'approximateOdds', label: '予想オッズ', align: 'right' },
            ].map(({ key, label, align }) => (
              <th
                key={key}
                onClick={() => onSort(key as keyof CombinationResult)}
                className={`
                  cursor-pointer p-2.5 text-xs text-slate-400
                  hover:text-slate-600 transition-colors
                  text-${align}
                `}
              >
                <div className={`flex items-center gap-1 justify-${align === 'left' ? 'start' : align === 'center' ? 'center' : 'end'}`}>
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
              return (
                <tr key={index} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="text-center p-2.5">
                    <span className={`inline-block w-7 text-center text-xs font-bold tabular-nums rounded-md py-0.5 ${
                      combo.rank <= 3 ? 'bg-slate-800 text-white' :
                      combo.rank <= 10 ? 'bg-slate-200 text-slate-700' :
                      'text-slate-400'
                    }`}>
                      {combo.rank}
                    </span>
                  </td>
                  <td className="text-left p-2.5 text-sm font-medium text-slate-700 tabular-nums">
                    {combo.horses.join('-')}
                  </td>
                  <td className={`text-right p-2.5 text-sm tabular-nums ${
                    combo.rank <= 3 ? 'text-slate-800 font-medium' :
                    combo.rank <= 10 ? 'text-slate-600' :
                    'text-slate-400'
                  }`}>
                    {(combo.probability * 100).toFixed(2)}%
                  </td>
                  <td className={`text-right p-2.5 text-sm font-bold tabular-nums ${
                    combo.ev >= 1.0 ? 'text-emerald-700' : 'text-rose-600'
                  }`}>
                    {Math.round(combo.ev * 100)}%
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
