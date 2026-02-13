"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import type { Race } from '@/lib/calculator/types'

type RacePickerCardProps = {
  races: Race[]
  loadingRaceId: string | null
  onImportOdds: (raceUrl: string) => void
}

export function RacePickerCard({ races, loadingRaceId, onImportOdds }: RacePickerCardProps) {
  return (
    <Card className="mb-8 border border-blue-100">
      <CardHeader className="py-3">
        <CardTitle className="text-lg font-medium text-gray-700">
          重賞レースピックアップ
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          以下のレースのオッズをインポートできます。インポートしたオッズは手動で調整可能です。
        </p>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-2 max-w-4xl mx-auto py-3">
        {races.length > 0 ? (
          races.map((race) => (
            <button
              key={race.date}
              type="button"
              onClick={() => onImportOdds(race.url)}
              disabled={loadingRaceId === race.url}
              className="group relative bg-white hover:bg-blue-50
                border border-blue-200 rounded-lg overflow-hidden transition-all duration-150
                shadow-sm hover:shadow-md disabled:cursor-not-allowed
                active:scale-[0.98] active:bg-blue-100 md:active:scale-100 md:active:bg-white
                tap-highlight-none p-2"
            >
              {loadingRaceId === race.url ? (
                <div className="flex items-center justify-center text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">インポート中...</span>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-blue-600">
                    {race.date}
                  </p>
                  <p className="text-base font-medium text-gray-800 truncate">
                    {race.name}
                  </p>
                </div>
              )}
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-blue-600
                transform scale-x-0 md:group-hover:scale-x-100 transition-transform duration-200" />
            </button>
          ))
        ) : (
          <div className="col-span-full text-center text-sm text-gray-500 py-2">
            現在インポートできるレースがありません
          </div>
        )}
      </CardContent>
    </Card>
  )
}
