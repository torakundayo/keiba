"use client"

import { useState, useMemo } from 'react'
import { useCalculatorContext } from '@/contexts/CalculatorContext'
import { useRaceData } from '@/hooks/useRaceData'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Loader2 } from 'lucide-react'
import { EmptyState } from './EmptyState'
import { LoadingSkeleton } from './LoadingSkeleton'
import { RaceHeader } from './RaceHeader'
import { StrategyComparison } from './StrategyComparison'
import { HorseSelector } from './HorseSelector'
import { FilterBar } from './FilterBar'
import { ResultsTable } from './ResultsTable'
import { ResultsCardView } from './ResultsCardView'
import { PaginationBar } from './PaginationBar'
import { TierLegend } from './TierLegend'
import type { Race } from '@/lib/calculator/types'

// Generic race names that don't need to be displayed
const GENERIC_NAMES = ['サラ系', '混合', '(混)', '未勝利', '1勝クラス', '2勝クラス', '3勝クラス', 'オープン']
function isNamedRace(name: string): boolean {
  // If the name contains parentheses with grade info like (GI), (GII), etc., or is a specific race name
  if (/\([GJ]/.test(name)) return true
  // If it doesn't start with common generic prefixes, it's likely named
  return !GENERIC_NAMES.some(g => name.startsWith(g))
}

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

  const [selectedDate, setSelectedDate] = useState<string | undefined>(undefined)
  const { data: raceData, error: raceError } = useRaceData(selectedDate)
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (raceError) {
    console.error('Race data error:', raceError)
  }

  // Group races by venue
  const venueGroups = useMemo(() => {
    if (!raceData?.races) return []
    const groups: { venue: string; races: Race[] }[] = []
    for (const race of raceData.races) {
      const venue = race.venue || '不明'
      let group = groups.find(g => g.venue === venue)
      if (!group) {
        group = { venue, races: [] }
        groups.push(group)
      }
      group.races.push(race)
    }
    return groups
  }, [raceData])

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
    const displayName = race.venue && race.raceNumber
      ? `${race.venue} ${race.raceNumber}R ${race.name}`
      : race.name
    importRaceOdds(race.url, displayName, race.date)
  }

  return (
    <div className="min-h-screen px-4 py-8 md:px-12 md:py-12">
      <div className="mx-auto max-w-4xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            3連複 買い目分析
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            レースを選んで、推奨される買い目を確認できます
          </p>
        </div>

        {/* Date selector */}
        {raceData?.dates && raceData.dates.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto mb-4">
            {raceData.dates.map((d) => {
              const isActive = selectedDate ? selectedDate === d.id : d.selected
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDate(d.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors
                    ${isActive
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-slate-200'
                    }`}
                >
                  {d.label}
                </button>
              )
            })}
          </div>
        )}

        {/* Race Picker - grouped by venue */}
        {venueGroups.length > 0 && (
          <section className="mb-8">
            <div className="space-y-4">
              {venueGroups.map((group) => (
                <div key={group.venue}>
                  <h3 className="text-xs font-medium text-slate-500 mb-2">{group.venue}</h3>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-1.5">
                    {group.races.map((race) => {
                      const isActive = activeRaceUrl === race.url
                      const isLoading = loadingRaceId === race.url
                      const named = isNamedRace(race.name)
                      return (
                        <button
                          key={race.url}
                          type="button"
                          onClick={() => handleImportRace(race)}
                          disabled={loadingRaceId !== null}
                          className={`py-2 px-1.5 rounded-md border text-center transition-all
                            ${isActive
                              ? 'border-slate-800 bg-slate-50 ring-1 ring-slate-300'
                              : 'border-slate-200 hover:border-slate-400'
                            }
                            ${isLoading ? 'opacity-60' : ''}
                            disabled:cursor-not-allowed
                          `}
                        >
                          {isLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400 mx-auto" />
                          ) : (
                            <>
                              <p className="text-sm font-medium text-slate-700">{race.raceNumber}R</p>
                              {named ? (
                                <p className="text-[10px] text-slate-600 font-medium truncate">{race.name}</p>
                              ) : (
                                <p className="text-[10px] text-slate-400">{race.time}</p>
                              )}
                            </>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
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

            <StrategyComparison combinations={sortedCombinations} />

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
