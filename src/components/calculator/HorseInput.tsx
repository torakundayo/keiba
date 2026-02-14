"use client"

import { Checkbox } from '@/components/ui/checkbox'
import type { PlaceOdds } from '@/lib/calculator/types'

type HorseInputProps = {
  index: number
  included: boolean
  odd: number
  horseName: string
  placeOdds: PlaceOdds
  onToggle: () => void
  onOddChange: (value: number) => void
}

export function HorseInput({
  index,
  included,
  odd,
  horseName,
  placeOdds,
  onToggle,
}: HorseInputProps) {
  const placeMid = placeOdds?.low > 0
    ? (placeOdds.low + placeOdds.high) / 2
    : 0
  const placeProb = placeMid > 0 ? 0.80 / placeMid : 0
  const stability = placeMid > 0 ? odd / placeMid : 0

  return (
    <div
      className={`${!included ? 'opacity-40' : ''
        } bg-white rounded-lg border border-slate-100 p-2.5 space-y-1 transition-colors cursor-pointer hover:bg-slate-50`}
      onClick={onToggle}
    >
      <div className="flex items-center gap-2">
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox checked={included} onCheckedChange={onToggle} />
        </div>
        <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-slate-800 text-white text-[10px] font-medium tabular-nums">
          {index + 1}
        </span>
        {horseName && (
          <span className="text-sm text-slate-700 truncate">{horseName}</span>
        )}
      </div>

      <div className="text-xs text-slate-500 space-y-0.5 pl-6 tabular-nums">
        {placeProb > 0 && (
          <p>複勝確率: <span className={placeProb > 0.5 ? 'text-emerald-700' : 'text-slate-600'}>
            {(placeProb * 100).toFixed(1)}%
          </span></p>
        )}
        {stability > 0 && (
          <p>安定度: <span className={stability > 3 ? 'text-emerald-700' : 'text-slate-600'}>
            {stability.toFixed(1)}
          </span></p>
        )}
        {odd > 1.0 && (
          <p>単勝: {odd.toFixed(1)} / 複勝: {placeOdds?.low > 0 ? `${placeOdds.low}-${placeOdds.high}` : '-'}</p>
        )}
      </div>
    </div>
  )
}
