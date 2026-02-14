"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Trophy } from 'lucide-react'
import type { Race } from '@/lib/calculator/types'

type RacePickerCardProps = {
  races: Race[]
  loadingRaceId: string | null
  onImportOdds: (raceUrl: string) => void
}

export function RacePickerCard({ races, loadingRaceId, onImportOdds }: RacePickerCardProps) {
  return (
    <Card className="mb-8 border border-slate-100 card-elevated rounded-xl bg-white">
      <CardContent className="p-5 md:p-6">
        <div className="flex items-center gap-2.5 mb-4">
          <Trophy className="h-4 w-4 text-amber-500" />
          <h3 className="text-sm font-semibold text-slate-700">
            重賞レースピックアップ
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          以下のレースのオッズをインポートできます。インポートしたオッズは手動で調整可能です。
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
          {races.length > 0 ? (
            races.map((race) => (
              <button
                key={race.date}
                type="button"
                onClick={() => onImportOdds(race.url)}
                disabled={loadingRaceId === race.url}
                className="group relative bg-white hover:bg-amber-50/50
                  border border-slate-200 hover:border-amber-300 rounded-xl overflow-hidden
                  transition-all duration-200 cursor-pointer
                  shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60
                  active:scale-[0.98] p-3 text-left"
              >
                {loadingRaceId === race.url ? (
                  <div className="flex items-center justify-center text-amber-600 py-1">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    <span className="text-xs">インポート中...</span>
                  </div>
                ) : (
                  <div>
                    <p className="text-[10px] font-medium text-amber-600/80 mb-0.5">
                      {race.date}
                    </p>
                    <p className="text-sm font-medium text-slate-700 truncate group-hover:text-slate-900">
                      {race.name}
                    </p>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-400 to-amber-500
                  transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </button>
            ))
          ) : (
            <div className="col-span-full text-center text-sm text-slate-400 py-4">
              現在インポートできるレースがありません
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
