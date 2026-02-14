"use client"

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { HorseInput } from './HorseInput'
import type { PlaceOdds } from '@/lib/calculator/types'

type HorseSelectorProps = {
  stakes: number[]
  odds: number[]
  placeOdds: PlaceOdds[]
  horseNames: string[]
  onToggleHorse: (index: number) => void
  onOddChange: (index: number, value: number) => void
}

export function HorseSelector({
  stakes,
  odds,
  placeOdds,
  horseNames,
  onToggleHorse,
  onOddChange,
}: HorseSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const hasData = (i: number) => odds[i] > 1.0 || horseNames[i] !== ''
  const anyDataLoaded = Array.from({ length: 18 }).some((_, i) => hasData(i))
  const hasPlaceData = placeOdds.some(p => p?.low > 0 && p?.high > 0)
  const includedCount = stakes.filter(s => s >= 100).length
  const totalHorses = Array.from({ length: 18 }).filter((_, i) => hasData(i)).length

  const analysisMap = new Map<number, { placeProb: number; stability: number }>()
  if (anyDataLoaded && hasPlaceData) {
    for (let i = 0; i < 18; i++) {
      if (hasData(i) && placeOdds[i]?.low > 0) {
        const placeMid = (placeOdds[i].low + placeOdds[i].high) / 2
        analysisMap.set(i, {
          placeProb: 0.80 / placeMid,
          stability: odds[i] / placeMid,
        })
      }
    }
  }

  return (
    <section className="border-b border-slate-100">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-3 text-left"
      >
        <span className="text-sm text-slate-600">
          出走馬
          <span className="text-slate-400 ml-1.5">
            ({totalHorses}頭中{includedCount}頭選択中)
          </span>
          {includedCount < 3 && (
            <span className="text-rose-500 ml-2 text-xs">3頭以上を選択してください</span>
          )}
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {isExpanded && (
        <div className="pb-4">
          {analysisMap.size > 0 && (
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              複勝確率 = 3着以内に来る確率。安定度 = 単勝÷複勝で、高いほど3連複向き。来ないと思う馬のチェックを外して候補を絞り込めます。
            </p>
          )}

          {/* Mobile: card layout */}
          <div className="grid grid-cols-2 gap-2 md:hidden">
            {Array.from({ length: 18 }, (_, i) => i)
              .filter(i => !anyDataLoaded || hasData(i))
              .map((i) => (
                <HorseInput
                  key={i}
                  index={i}
                  included={stakes[i] >= 100}
                  odd={odds[i]}
                  horseName={horseNames[i]}
                  placeOdds={placeOdds[i]}
                  onToggle={() => onToggleHorse(i)}
                  onOddChange={(value) => onOddChange(i, value)}
                />
              ))}
          </div>

          {/* Desktop: table layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-center p-2.5 w-[40px] text-xs text-slate-400">選択</th>
                  <th className="text-left p-2.5 w-[40px] text-xs text-slate-400">#</th>
                  <th className="text-left p-2.5 w-[120px] text-xs text-slate-400">馬名</th>
                  <th className="text-center p-2.5 text-xs text-slate-400">単勝</th>
                  <th className="text-center p-2.5 text-xs text-slate-400">複勝</th>
                  <th className="text-center p-2.5 w-[80px] text-xs text-slate-400">複勝確率</th>
                  <th className="text-center p-2.5 w-[60px] text-xs text-slate-400">安定度</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 18 }, (_, i) => i)
                  .filter(i => !anyDataLoaded || hasData(i))
                  .map((i) => {
                    const included = stakes[i] >= 100
                    const analysis = analysisMap.get(i)
                    return (
                      <tr
                        key={i}
                        className={`border-b border-slate-50 transition-colors cursor-pointer ${
                          !included ? 'opacity-40' : 'hover:bg-slate-50'
                        }`}
                        onClick={() => onToggleHorse(i)}
                      >
                        <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={included}
                            onCheckedChange={() => onToggleHorse(i)}
                          />
                        </td>
                        <td className="p-2.5">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-800 text-white text-xs font-medium tabular-nums">
                            {i + 1}
                          </span>
                        </td>
                        <td className="p-2.5 text-sm text-slate-800 truncate max-w-[120px]">
                          {horseNames[i] || '-'}
                        </td>
                        <td className="p-2.5 text-center text-sm tabular-nums text-slate-600">
                          {odds[i] > 1.0 ? odds[i].toFixed(1) : '-'}
                        </td>
                        <td className="p-2.5 text-center text-sm tabular-nums text-slate-500">
                          {placeOdds[i]?.low > 0
                            ? `${placeOdds[i].low}-${placeOdds[i].high}`
                            : '-'}
                        </td>
                        <td className="p-2.5 text-center text-sm tabular-nums">
                          {analysis ? (
                            <span className={analysis.placeProb > 0.5 ? 'text-emerald-700' : 'text-slate-600'}>
                              {(analysis.placeProb * 100).toFixed(1)}%
                            </span>
                          ) : '-'}
                        </td>
                        <td className="p-2.5 text-center text-sm tabular-nums">
                          {analysis ? (
                            <span className={analysis.stability > 3 ? 'text-emerald-700' : 'text-slate-600'}>
                              {analysis.stability.toFixed(1)}
                            </span>
                          ) : '-'}
                        </td>
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
