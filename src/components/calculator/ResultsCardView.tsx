"use client"

import type { CombinationResult } from '@/lib/calculator/types'
import { RESULTS_PER_PAGE } from '@/lib/calculator/types'

const TIER_LABELS = {
  recommended: { text: '推奨', className: 'bg-emerald-100 text-emerald-700' },
  promising: { text: '有望', className: 'bg-teal-100 text-teal-700' },
  solid: { text: '堅実', className: 'bg-sky-100 text-sky-700' },
  longshot: { text: '穴狙い', className: 'bg-amber-100 text-amber-700' },
  avoid: { text: '非推奨', className: 'bg-slate-100 text-slate-500' },
} as const

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
          const tierInfo = TIER_LABELS[combo.tier]
          const isLowProbRecommended = (combo.tier === 'recommended' || combo.tier === 'promising') && combo.probability < 0.001
          return (
            <div key={idx} className={`p-3 border border-slate-100 rounded-lg hover:bg-slate-50 transition-colors ${
              isLowProbRecommended ? 'opacity-50' : ''
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="font-medium text-slate-700 tabular-nums text-sm">
                  {combo.horses.join('-')}
                </p>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${tierInfo.className}`}>
                  {tierInfo.text}
                </span>
              </div>
              <p className={`text-lg font-bold tabular-nums ${
                combo.ev >= 1.0 ? 'text-emerald-700' : 'text-rose-600'
              }`}>
                {Math.round(combo.ev * 100)}%
                <span className="text-xs font-normal text-slate-400 ml-1">割安度</span>
              </p>
              <div className="text-xs text-slate-500 space-y-0.5 mt-1.5 tabular-nums">
                <p>確率: <span className={
                  combo.probability >= 0.005 ? 'text-slate-800 font-medium' :
                  combo.probability >= 0.001 ? 'text-slate-600' :
                  'text-slate-400'
                }>{(combo.probability * 100).toFixed(2)}%</span></p>
                <p>予想オッズ: {combo.approximateOdds.toFixed(1)}</p>
                {combo.comboStability > 0 && (
                  <p>安定度積: {combo.comboStability.toFixed(1)}</p>
                )}
              </div>
            </div>
          )
        })}
    </div>
  )
}
