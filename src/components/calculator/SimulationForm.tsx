"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calculator, Loader2, X } from 'lucide-react'
import { HorseInput } from './HorseInput'
import { RacePickerCard } from './RacePickerCard'
import type { Race, OptimizationProgress } from '@/lib/calculator/types'

type SimulationFormProps = {
  races: Race[] | undefined
  stakes: number[]
  odds: number[]
  horseNames: string[]
  loadingRaceId: string | null
  isAutoCalculating: boolean
  progress: OptimizationProgress | null
  onImportOdds: (raceUrl: string) => void
  onStakeChange: (index: number, value: number) => void
  onOddChange: (index: number, value: number) => void
  onSubmit: (e: React.FormEvent) => void
  onOptimize: () => void
  onSetIsAutoCalculating: (value: boolean) => void
  onReset: () => void
}

export function SimulationForm({
  races,
  stakes,
  odds,
  horseNames,
  loadingRaceId,
  isAutoCalculating,
  progress,
  onImportOdds,
  onStakeChange,
  onOddChange,
  onSubmit,
  onOptimize,
  onSetIsAutoCalculating,
  onReset,
}: SimulationFormProps) {
  return (
    <Card className="mb-10 shadow-2xl border-0 rounded-xl overflow-hidden">
      <CardHeader className="bg-blue-500 py-4">
        <CardTitle className="text-xl md:text-2xl text-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Calculator className="h-5 w-5 md:h-7 md:w-7 text-white" />
            <span>シミュレーションする</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 md:py-8 md:px-8 md:pt-6">
        {races && (
          <RacePickerCard
            races={races}
            loadingRaceId={loadingRaceId}
            onImportOdds={onImportOdds}
          />
        )}

        <p className="text-sm text-gray-600 mb-3">
          自動最適化機能は、各馬の重みを自動で調整し、期待値が最も高くなる組み合わせを探索します。
          計算には時間がかかる場合があります。
        </p>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <Button
            type="button"
            disabled={false}
            onClick={() => {
              if (isAutoCalculating) {
                onSetIsAutoCalculating(false)
              } else {
                onOptimize()
              }
            }}
            className="w-full md:w-auto bg-green-600 hover:bg-green-700 transition-all duration-200
              shadow-md hover:shadow-xl active:translate-y-0
              text-white font-medium px-6 py-2 rounded-xl disabled:opacity-50"
          >
            {isAutoCalculating ? (
              <div className="flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>
                  {progress
                    ? `最適化中... ${Math.round(progress.current / progress.total * 100)}%（クリックで中止）`
                    : '最適化中...（クリックで中止）'}
                </span>
              </div>
            ) : (
              '自動最適化を実行'
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="w-full md:w-auto text-gray-600 hover:text-gray-800"
          >
            <X className="h-4 w-4 mr-2" />
            全ての設定をリセット
          </Button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 max-w-6xl mx-auto">
              {Array.from({ length: 18 }).map((_, i) => (
                <HorseInput
                  key={i}
                  index={i}
                  stake={stakes[i]}
                  odd={odds[i]}
                  horseName={horseNames[i]}
                  onStakeChange={(value) => onStakeChange(i, value)}
                  onOddChange={(value) => onOddChange(i, value)}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <Button
              type="submit"
              className="min-w-[140px] bg-blue-600 hover:bg-blue-700 transition-all duration-200
                shadow-md hover:shadow-xl active:translate-y-0
                text-white font-medium px-6 py-2 rounded-xl"
            >
              計算する
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
