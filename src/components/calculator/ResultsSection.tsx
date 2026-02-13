"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ResultsSummary } from './ResultsSummary'
import { ResultsTable } from './ResultsTable'
import { ResultsCardView } from './ResultsCardView'
import type { CalculationResult, CombinationResult, SortConfig } from '@/lib/calculator/types'

type ResultsSectionProps = {
  results: CalculationResult
  sortedCombinations: CombinationResult[]
  displayMode: 'card' | 'table'
  sortConfig: SortConfig
  showAllResults: boolean
  isDesktop: boolean
  resultsRef: React.RefObject<HTMLDivElement>
  onSort: (key: keyof CombinationResult) => void
  onSetDisplayMode: (mode: 'card' | 'table') => void
  onSetShowAll: (show: boolean) => void
}

export function ResultsSection({
  results,
  sortedCombinations,
  displayMode,
  sortConfig,
  showAllResults,
  isDesktop,
  resultsRef,
  onSort,
  onSetDisplayMode,
  onSetShowAll,
}: ResultsSectionProps) {
  return (
    <Card className="mb-10 overflow-hidden border-2 border-blue-400 shadow-xl" ref={resultsRef}>
      <CardHeader className="bg-blue-500 py-4">
        <CardTitle className="text-2xl text-white">
          <span>計算結果</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8 p-5 md:p-8 bg-white">
        <ResultsSummary results={results} />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">買い目と期待リターン</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onSetDisplayMode(displayMode === 'table' ? 'card' : 'table')
                onSetShowAll(false)
              }}
              className="text-blue-600 hover:text-blue-700"
            >
              {displayMode === 'table' ? 'カード表示' : 'テーブル表示'}
            </Button>
          </div>

          {displayMode === 'table' ? (
            <ResultsTable
              sortedCombinations={sortedCombinations}
              sortConfig={sortConfig}
              showAllResults={showAllResults}
              resultsRef={resultsRef}
              onSort={onSort}
              onSetShowAll={onSetShowAll}
            />
          ) : (
            <ResultsCardView
              combinations={results.combinations}
              isDesktop={isDesktop}
              showAllResults={showAllResults}
              resultsRef={resultsRef}
              onSetShowAll={onSetShowAll}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
