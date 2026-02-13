"use client"

import { useCalculator } from '@/hooks/useCalculator'
import { useRaceData } from '@/hooks/useRaceData'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { ExplanationCard } from './ExplanationCard'
import { SimulationForm } from './SimulationForm'
import { ResultsSection } from './ResultsSection'

export default function TrifectaReturnCalculator() {
  const {
    stakes,
    odds,
    horseNames,
    isClient,
    results,
    resultsRef,
    displayMode,
    setDisplayMode,
    sortConfig,
    loadingRaceId,
    isAutoCalculating,
    setIsAutoCalculating,
    progress,
    showAllResults,
    setShowAllResults,
    sortedCombinations,
    handleSort,
    importRaceOdds,
    handleSubmit,
    handleStakeChange,
    handleOddChange,
    calculateOptimalStakes,
    resetAll,
  } = useCalculator()

  const { data: raceData, error: raceError } = useRaceData()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  if (raceError) {
    console.error('Race data error:', raceError)
  }

  if (!isClient) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 px-2 py-6 md:p-12 md:text-base">
      <div className="mx-auto max-w-5xl">
        <div className="relative mb-8 text-center">
          <h1 className="mb-12 text-center text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800
            bg-clip-text text-transparent">
            3連複期待リターン<span className="block md:inline">計算ツール</span>
          </h1>
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-1
              bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
        </div>

        <ExplanationCard />

        <SimulationForm
          races={raceData?.races}
          stakes={stakes}
          odds={odds}
          horseNames={horseNames}
          loadingRaceId={loadingRaceId}
          isAutoCalculating={isAutoCalculating}
          progress={progress}
          onImportOdds={importRaceOdds}
          onStakeChange={handleStakeChange}
          onOddChange={handleOddChange}
          onSubmit={handleSubmit}
          onOptimize={calculateOptimalStakes}
          onSetIsAutoCalculating={setIsAutoCalculating}
          onReset={resetAll}
        />

        {results && (
          <ResultsSection
            results={results}
            sortedCombinations={sortedCombinations}
            displayMode={displayMode}
            sortConfig={sortConfig}
            showAllResults={showAllResults}
            isDesktop={isDesktop}
            resultsRef={resultsRef}
            onSort={handleSort}
            onSetDisplayMode={setDisplayMode}
            onSetShowAll={setShowAllResults}
          />
        )}

      </div>
    </div>
  )
}
