import { useState, useRef, useMemo, useEffect, useCallback } from 'react'
import type { RecommendationTier } from '@/lib/calculator/types'
import { calculateResultsForStakes } from '@/lib/calculator/calculateResults'
import type {
  CalculationResult,
  CombinationResult,
  SortConfig,
  PlaceOdds,
} from '@/lib/calculator/types'
import axios from 'axios'

const DEFAULT_PLACE_ODDS: PlaceOdds = { low: 0, high: 0 }

export function useCalculator() {
  const [step, setStep] = useState(0)
  const [stakes, setStakes] = useState<number[]>([])
  const [odds, setOdds] = useState<number[]>([])
  const [placeOdds, setPlaceOdds] = useState<PlaceOdds[]>([])
  const [horseNames, setHorseNames] = useState<string[]>([])
  const [isClient, setIsClient] = useState(false)
  const [results, setResults] = useState<CalculationResult | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const [displayMode, setDisplayMode] = useState<'card' | 'table'>('table')
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'tier',
    direction: 'asc',
  })
  const [loadingRaceId, setLoadingRaceId] = useState<string | null>(null)
  const [showAllResults, setShowAllResults] = useState(false)
  const [activeRaceUrl, setActiveRaceUrl] = useState<string | null>(null)
  const [activeRaceName, setActiveRaceName] = useState('')
  const [activeRaceDate, setActiveRaceDate] = useState('')
  const [tierFilter, setTierFilter] = useState<string>('all')

  const TIER_ORDER: Record<string, number> = {
    recommended: 0,
    promising: 1,
    solid: 2,
    longshot: 3,
    avoid: 4,
  }

  const handleSort = (key: keyof CombinationResult) => {
    setSortConfig((currentConfig) => {
      if (!currentConfig || currentConfig.key !== key) {
        return { key, direction: key === 'tier' ? 'asc' : 'desc' }
      }
      return { key, direction: currentConfig.direction === 'asc' ? 'desc' : 'asc' }
    })
  }

  const sortedCombinations = useMemo(() => {
    if (!results || !sortConfig) return results?.combinations || []

    return [...results.combinations].sort((a, b) => {
      if (sortConfig.key === 'horses') {
        const aStr = a.horses.join('-')
        const bStr = b.horses.join('-')
        return sortConfig.direction === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr)
      }

      if (sortConfig.key === 'tier') {
        const tierDiff = TIER_ORDER[a.tier] - TIER_ORDER[b.tier]
        const dir = sortConfig.direction === 'asc' ? 1 : -1
        if (tierDiff !== 0) return tierDiff * dir
        // 同じtier内は確率降順
        return b.probability - a.probability
      }

      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]
      return sortConfig.direction === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number)
    })
  }, [results, sortConfig])

  const filteredCombinations = useMemo(() => {
    if (tierFilter === 'all') return sortedCombinations
    return sortedCombinations.filter(c => c.tier === tierFilter)
  }, [sortedCombinations, tierFilter])

  useEffect(() => {
    setStakes(Array(18).fill(0))
    setOdds(Array(18).fill(1.0))
    setPlaceOdds(Array(18).fill(DEFAULT_PLACE_ODDS))
    setHorseNames(Array(18).fill(''))
    setIsClient(true)
  }, [])

  // 自動計算: stakes, odds, placeOdds が変わるたびに再計算
  const runCalculation = useCallback((
    currentStakes: number[],
    currentOdds: number[],
    currentPlaceOdds: PlaceOdds[],
    currentHorseNames: string[],
  ) => {
    const includedCount = currentStakes.filter(s => s >= 100).length
    if (includedCount < 3) {
      setResults(null)
      return
    }
    try {
      const result = calculateResultsForStakes(currentStakes, currentOdds, currentPlaceOdds, currentHorseNames)
      setResults(result)
    } catch {
      setResults(null)
    }
  }, [])

  useEffect(() => {
    if (!isClient || stakes.length === 0) return
    runCalculation(stakes, odds, placeOdds, horseNames)
  }, [stakes, odds, placeOdds, horseNames, isClient, runCalculation])

  const importRaceOdds = async (raceUrl: string, raceName?: string, raceDate?: string) => {
    try {
      setLoadingRaceId(raceUrl)
      const encodedUrl = encodeURIComponent(raceUrl)
      const response = await axios.get<Array<{
        name: string
        odds: number
        placeOddsLow: number
        placeOddsHigh: number
      }>>(`/api/race-odds/${encodedUrl}`)
      const horseOddsData = response.data

      const newOdds = Array(18).fill(1.0)
      const newPlaceOdds: PlaceOdds[] = Array(18).fill(null).map(() => ({ low: 0, high: 0 }))
      const newHorseNames = Array(18).fill('')

      horseOddsData.forEach((horse, index) => {
        if (index < 18) {
          newOdds[index] = horse.odds
          newPlaceOdds[index] = { low: horse.placeOddsLow, high: horse.placeOddsHigh }
          newHorseNames[index] = horse.name
        }
      })

      // 有効なデータがある馬だけ自動的に含める
      const newStakes = Array(18).fill(0)
      horseOddsData.forEach((horse, index) => {
        if (index < 18 && horse.odds > 1.0) {
          newStakes[index] = 100
        }
      })

      // レースメタデータを保存
      setActiveRaceUrl(raceUrl)
      setActiveRaceName(raceName ?? '')
      setActiveRaceDate(raceDate ?? '')
      setTierFilter('all')

      // 一括更新（useEffectが自動計算する）
      setOdds(newOdds)
      setPlaceOdds(newPlaceOdds)
      setHorseNames(newHorseNames)
      setStakes(newStakes)
    } catch (error) {
      console.error('Failed to import odds:', error)
    } finally {
      setLoadingRaceId(null)
    }
  }

  const toggleHorse = (index: number) => {
    setStakes(prev => {
      const newArr = [...prev]
      newArr[index] = newArr[index] >= 100 ? 0 : 100
      return newArr
    })
  }

  const handleOddChange = (index: number, value: number) => {
    setOdds(prev => {
      const newArr = [...prev]
      newArr[index] = value
      return newArr
    })
  }

  const resetAll = () => {
    setStakes(Array(18).fill(0))
    setOdds(Array(18).fill(1.0))
    setPlaceOdds(Array(18).fill(null).map(() => ({ low: 0, high: 0 })))
    setHorseNames(Array(18).fill(''))
    setResults(null)
    setActiveRaceUrl(null)
    setActiveRaceName('')
    setActiveRaceDate('')
    setTierFilter('all')
  }

  return {
    step,
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
  }
}
