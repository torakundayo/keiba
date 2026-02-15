"use client"

import type { CombinationResult } from '@/lib/calculator/types'
import { RESULTS_PER_PAGE } from '@/lib/calculator/types'

type ResultsCardViewProps = {
  combinations: CombinationResult[]
  isDesktop: boolean
  showAllResults: boolean
  resultsRef: React.RefObject<HTMLDivElement>
  onSetShowAll: (show: boolean) => void
}

export function ResultsCardView({
  combinations,
  isDesktop,
  showAllResults,
}: ResultsCardViewProps) {
  const perPage = isDesktop ? RESULTS_PER_PAGE.desktop : RESULTS_PER_PAGE.mobile

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {combinations
        .slice(0, showAllResults ? undefined : perPage)
        .map((combo, idx) => {
          return (
            <div key={idx} className="p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <p className="font-medium text-slate-700 tabular-nums text-sm">
                  {combo.horses.join('-')}
                </p>
                <span className={`inline-block w-7 text-center text-[10px] font-bold tabular-nums rounded py-0.5 ${
                  combo.rank <= 3 ? 'bg-slate-800 text-white' :
                  combo.rank <= 10 ? 'bg-slate-200 text-slate-700' :
                  'text-slate-400'
                }`}>
                  {combo.rank}
                </span>
              </div>
              <p className={`text-lg font-bold tabular-nums ${
                combo.ev >= 1.0 ? 'text-emerald-700' : 'text-rose-600'
              }`}>
                {Math.round(combo.ev * 100)}%
                <span className="text-xs font-normal text-slate-400 ml-1">期待回収率</span>
              </p>
              <div className="text-xs text-slate-500 space-y-0.5 mt-1.5 tabular-nums">
                <p>確率: <span className={
                  combo.rank <= 3 ? 'text-slate-800 font-medium' :
                  combo.rank <= 10 ? 'text-slate-600' :
                  'text-slate-400'
                }>{(combo.probability * 100).toFixed(2)}%</span></p>
                <p>予想オッズ: {combo.approximateOdds.toFixed(1)}</p>
              </div>
            </div>
          )
        })}
    </div>
  )
}
