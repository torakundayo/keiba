"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Calculator, X } from 'lucide-react'
import { HorseInput } from './HorseInput'
import { RacePickerCard } from './RacePickerCard'
import type { Race, PlaceOdds } from '@/lib/calculator/types'

type SimulationFormProps = {
  races: Race[] | undefined
  stakes: number[]
  odds: number[]
  placeOdds: PlaceOdds[]
  horseNames: string[]
  loadingRaceId: string | null
  onImportOdds: (raceUrl: string) => void
  onToggleHorse: (index: number) => void
  onOddChange: (index: number, value: number) => void
  onReset: () => void
}

export function SimulationForm({
  races,
  stakes,
  odds,
  placeOdds,
  horseNames,
  loadingRaceId,
  onImportOdds,
  onToggleHorse,
  onOddChange,
  onReset,
}: SimulationFormProps) {
  const hasData = (i: number) => odds[i] > 1.0 || horseNames[i] !== ''
  const anyDataLoaded = Array.from({ length: 18 }).some((_, i) => hasData(i))
  const hasPlaceData = placeOdds.some(p => p?.low > 0 && p?.high > 0)
  const includedCount = stakes.filter(s => s >= 100).length

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
    <Card className="mb-10 card-elevated-lg border-0 rounded-2xl overflow-hidden bg-white">
      <CardContent className="p-0">
        {/* Header */}
        <div className="px-6 py-4 md:px-8 md:py-5 border-b border-slate-100 bg-gradient-to-r from-slate-800 to-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10">
                <Calculator className="h-5 w-5 text-amber-300" />
              </div>
              <span className="font-serif text-lg md:text-xl font-semibold text-white">
                シミュレーションする
              </span>
            </div>
          </div>
        </div>

        <div className="p-5 md:py-7 md:px-8">
          {races && (
            <RacePickerCard
              races={races}
              loadingRaceId={loadingRaceId}
              onImportOdds={onImportOdds}
            />
          )}

          {analysisMap.size > 0 && (
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              複勝確率 = 3着以内に来る確率。安定度 = 単勝÷複勝で、高いほど3連複向き。来ないと思う馬のチェックを外して候補を絞り込んでください。
            </p>
          )}

          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-slate-500">
              選択中: <span className="font-bold text-amber-600 tabular-nums">{includedCount}</span> 頭
              {includedCount < 3 && <span className="text-rose-500 ml-2 text-xs">（3頭以上を選択）</span>}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onReset}
              className="text-slate-500 hover:text-slate-700 border-slate-200 hover:border-slate-300 rounded-lg"
            >
              <X className="h-3.5 w-3.5 mr-1.5" />
              リセット
            </Button>
          </div>

          <div className="space-y-6">
            {/* Mobile: card layout */}
            <div className="grid grid-cols-2 gap-2.5 md:hidden">
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
                  <tr className="border-b-2 border-slate-100">
                    <th className="text-center p-3 w-[40px] text-xs font-semibold text-slate-400 uppercase tracking-wider">選択</th>
                    <th className="text-left p-3 w-[40px] text-xs font-semibold text-slate-400 uppercase tracking-wider">#</th>
                    <th className="text-left p-3 w-[120px] text-xs font-semibold text-slate-400 uppercase tracking-wider">馬名</th>
                    <th className="text-center p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">単勝</th>
                    <th className="text-center p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">複勝</th>
                    <th className="text-center p-3 w-[80px] text-xs font-semibold text-slate-400 uppercase tracking-wider">複勝確率</th>
                    <th className="text-center p-3 w-[60px] text-xs font-semibold text-slate-400 uppercase tracking-wider">安定度</th>
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
                          className={`border-b border-slate-50 transition-colors duration-200 cursor-pointer ${
                            !included ? 'opacity-40' : 'hover:bg-amber-50/30'
                          }`}
                          onClick={() => onToggleHorse(i)}
                        >
                          <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={included}
                              onCheckedChange={() => onToggleHorse(i)}
                            />
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800 text-white text-xs font-bold tabular-nums">
                              {i + 1}
                            </span>
                          </td>
                          <td className="p-3 text-sm font-medium text-slate-800 truncate max-w-[120px]">
                            {horseNames[i] || '-'}
                          </td>
                          <td className="p-3 text-center text-sm tabular-nums text-slate-600">
                            {odds[i] > 1.0 ? odds[i].toFixed(1) : '-'}
                          </td>
                          <td className="p-3 text-center text-sm tabular-nums text-slate-500">
                            {placeOdds[i]?.low > 0
                              ? `${placeOdds[i].low}-${placeOdds[i].high}`
                              : '-'}
                          </td>
                          <td className="p-3 text-center text-sm font-medium tabular-nums">
                            {analysis ? (
                              <span className={`font-bold ${
                                analysis.placeProb > 0.5 ? 'text-emerald-600' :
                                analysis.placeProb > 0.3 ? 'text-sky-600' :
                                'text-slate-400'
                              }`}>
                                {(analysis.placeProb * 100).toFixed(1)}%
                              </span>
                            ) : '-'}
                          </td>
                          <td className="p-3 text-center text-sm font-medium tabular-nums">
                            {analysis ? (
                              <span className={`font-bold ${
                                analysis.stability > 3 ? 'text-emerald-600' :
                                analysis.stability > 2 ? 'text-sky-600' :
                                'text-slate-400'
                              }`}>
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
        </div>
      </CardContent>
    </Card>
  )
}
