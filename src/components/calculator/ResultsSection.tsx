"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3 } from 'lucide-react'
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
    <Card className="mb-10 overflow-hidden card-elevated-lg border-0 rounded-2xl bg-white animate-slide-up" ref={resultsRef}>
      <CardContent className="p-0">
        {/* Header */}
        <div className="px-6 py-4 md:px-8 md:py-5 border-b border-slate-100 bg-gradient-to-r from-emerald-700 to-emerald-600">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10">
              <BarChart3 className="h-5 w-5 text-emerald-200" />
            </div>
            <span className="font-serif text-lg md:text-xl font-semibold text-white">
              計算結果
            </span>
          </div>
        </div>

        <div className="p-5 md:p-8 space-y-8">
          <ResultsSummary results={results} />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-serif font-semibold text-slate-800">買い目一覧</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onSetDisplayMode(displayMode === 'table' ? 'card' : 'table')
                  onSetShowAll(false)
                }}
                className="text-slate-500 hover:text-slate-700 border-slate-200 hover:border-slate-300 rounded-lg text-xs"
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
                combinations={sortedCombinations}
                isDesktop={isDesktop}
                showAllResults={showAllResults}
                resultsRef={resultsRef}
                onSetShowAll={onSetShowAll}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
