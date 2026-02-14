"use client"

import { useCalculatorContext } from '@/contexts/CalculatorContext'
import { useRaceData } from '@/hooks/useRaceData'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Loader2 } from 'lucide-react'
import { EmptyState } from './EmptyState'
import { LoadingSkeleton } from './LoadingSkeleton'
import { RaceHeader } from './RaceHeader'
import { QuickStats } from './QuickStats'
import { HorseSelector } from './HorseSelector'
import { FilterBar } from './FilterBar'
import { ResultsTable } from './ResultsTable'
import { ResultsCardView } from './ResultsCardView'
import { PaginationBar } from './PaginationBar'
import { TierLegend } from './TierLegend'
import type { Race } from '@/lib/calculator/types'

export default function TrifectaReturnCalculator() {
  const {
    stakes,
    odds,
    placeOdds,
    horseNames,
    isClient,
    results,
    resultsRef,
    displayMode,
    setDisplayMode,
    sortConfig,
    loadingRaceId,
    showAllResults,
    setShowAllResults,
    sortedCombinations,
    filteredCombinations,
    activeRaceUrl,
    activeRaceName,
    activeRaceDate,
    tierFilter,
    setTierFilter,
    handleSort,
    importRaceOdds,
    toggleHorse,
    handleOddChange,
    resetAll,
  } = useCalculatorContext()

  const { data: raceData, error: raceError } = useRaceData()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (raceError) {
    console.error('Race data error:', raceError)
  }

  if (!isClient) {
    return <div className="py-20 text-center text-sm text-slate-400">読み込み中...</div>
  }

  // 3 states: empty, loading, analysis
  const pageState = !results && !loadingRaceId
    ? 'empty'
    : loadingRaceId
      ? 'loading'
      : 'analysis'

  const handleImportRace = (race: Race) => {
    importRaceOdds(race.url, race.name, race.date)
  }

  return (
    <div className="min-h-screen px-4 py-8 md:px-12 md:py-12">
      <div className="mx-auto max-w-4xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            3連複 期待リターン計算ツール
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            レースを選んで、買い目の期待回収率を確認できます
          </p>
        </div>

        {/* Race Picker - always visible at top */}
        {raceData?.races && raceData.races.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-3">
              レースを選択
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {raceData.races.map((race) => {
                const isActive = activeRaceUrl === race.url
                const isLoading = loadingRaceId === race.url
                return (
                  <button
                    key={race.url}
                    type="button"
                    onClick={() => handleImportRace(race)}
                    disabled={loadingRaceId !== null}
                    className={`p-3 rounded-lg border text-left transition-all
                      ${isActive
                        ? 'border-slate-800 bg-slate-50 ring-1 ring-slate-300'
                        : 'border-slate-200 hover:border-slate-400'
                      }
                      ${isLoading ? 'opacity-60' : ''}
                      disabled:cursor-not-allowed
                    `}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2 py-0.5">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />
                        <span className="text-xs text-slate-400">読み込み中...</span>
                      </div>
                    ) : (
                      <>
                        <p className="text-[11px] text-slate-400">{race.date}</p>
                        <p className="text-sm font-medium text-slate-700 truncate">{race.name}</p>
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* Content area: 3 states */}
        {pageState === 'empty' && <EmptyState />}
        {pageState === 'loading' && <LoadingSkeleton />}
        {pageState === 'analysis' && results && (
          <div ref={resultsRef}>
            <RaceHeader
              raceName={activeRaceName}
              raceDate={activeRaceDate}
              onReset={resetAll}
            />

            <QuickStats results={results} />

            <HorseSelector
              stakes={stakes}
              odds={odds}
              placeOdds={placeOdds}
              horseNames={horseNames}
              onToggleHorse={toggleHorse}
              onOddChange={handleOddChange}
            />

            <FilterBar
              combinations={sortedCombinations}
              activeFilter={tierFilter}
              onFilterChange={setTierFilter}
            />

            {/* Display mode toggle + count */}
            <div className="flex items-center justify-between py-3">
              <span className="text-xs text-slate-400 tabular-nums">
                {filteredCombinations.length}通り
              </span>
              <button
                type="button"
                onClick={() => {
                  setDisplayMode(displayMode === 'table' ? 'card' : 'table')
                  setShowAllResults(false)
                }}
                className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
              >
                {displayMode === 'table' ? 'カード表示' : 'テーブル表示'}
              </button>
            </div>

            {displayMode === 'table' ? (
              <ResultsTable
                sortedCombinations={filteredCombinations}
                sortConfig={sortConfig}
                showAllResults={showAllResults}
                resultsRef={resultsRef}
                onSort={handleSort}
                onSetShowAll={setShowAllResults}
              />
            ) : (
              <ResultsCardView
                combinations={filteredCombinations}
                isDesktop={isDesktop}
                showAllResults={showAllResults}
                resultsRef={resultsRef}
                onSetShowAll={setShowAllResults}
              />
            )}

            <PaginationBar
              visibleCount={isDesktop ? 21 : 20}
              totalCount={filteredCombinations.length}
              showAll={showAllResults}
              onToggle={setShowAllResults}
              scrollRef={resultsRef}
            />

            <TierLegend />
          </div>
        )}
      </div>
    </div>
  )
}
