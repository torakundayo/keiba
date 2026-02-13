"use client"

import { Button } from '@/components/ui/button'
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
  resultsRef,
  onSetShowAll,
}: ResultsCardViewProps) {
  const perPage = isDesktop ? RESULTS_PER_PAGE.desktop : RESULTS_PER_PAGE.mobile

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {combinations
        .slice(0, showAllResults ? undefined : perPage)
        .map((combo, idx) => (
          <div key={idx} className="p-4 border rounded-xl hover:bg-blue-50 transition-all">
            <p className="font-medium">
              {combo.horses.join('-')}
            </p>
            <div className="text-sm text-gray-600 space-y-1">
              <p>掛け金: {combo.stake.toLocaleString()}円</p>
              <p>予想オッズ: {combo.approximateOdds.toFixed(1)}</p>
              <p>期待リターン: {Math.round(combo.expectedReturn).toLocaleString()}円</p>
            </div>
          </div>
        ))}

      {!showAllResults && combinations.length > perPage && (
        <div className="col-span-full flex justify-center mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSetShowAll(true)}
            className="text-blue-600 hover:text-blue-700"
          >
            残り{combinations.length - perPage}件を表示
          </Button>
        </div>
      )}

      {showAllResults && combinations.length > perPage && (
        <div className="col-span-full flex justify-center mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onSetShowAll(false)
              resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }}
            className="text-blue-600 hover:text-blue-700"
          >
            表示を折りたたむ
          </Button>
        </div>
      )}
    </div>
  )
}
