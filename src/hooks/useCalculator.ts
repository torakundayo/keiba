import { useState, useRef, useMemo, useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { calculateResultsForStakes } from '@/lib/calculator/calculateResults'
import { optimizeStakes } from '@/lib/calculator/optimizeStakes'
import { combinations } from '@/lib/calculator/combinations'
import type {
  CalculationResult,
  CombinationResult,
  SortConfig,
  OptimizationProgress,
} from '@/lib/calculator/types'
import axios from 'axios'

export function useCalculator() {
  const [step, setStep] = useState(0)
  const [stakes, setStakes] = useState<number[]>([])
  const [odds, setOdds] = useState<number[]>([])
  const [horseNames, setHorseNames] = useState<string[]>([])
  const [isClient, setIsClient] = useState(false)
  const [results, setResults] = useState<CalculationResult | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const [displayMode, setDisplayMode] = useState<'card' | 'table'>('table')
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'horses',
    direction: 'asc',
  })
  const [loadingRaceId, setLoadingRaceId] = useState<string | null>(null)
  const [isAutoCalculating, setIsAutoCalculating] = useState(false)
  const [optimalResult, setOptimalResult] = useState<{
    stakes: number[]
    expectedValue: number
    weightedReturn: number
    totalStakes: number
  } | null>(null)
  const [progress, setProgress] = useState<OptimizationProgress | null>(null)
  const { toast } = useToast()
  const [showAllResults, setShowAllResults] = useState(false)

  // ソート関数
  const handleSort = (key: keyof CombinationResult) => {
    setSortConfig((currentConfig) => {
      if (!currentConfig || currentConfig.key !== key) {
        return { key, direction: 'asc' }
      }
      return { key, direction: currentConfig.direction === 'asc' ? 'desc' : 'asc' }
    })
  }

  // ソートされた結果を取得
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

      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]
      return sortConfig.direction === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number)
    })
  }, [results, sortConfig])

  useEffect(() => {
    setStakes(Array(18).fill(100))
    setOdds(Array(18).fill(1.0))
    setHorseNames(Array(18).fill(''))
    setIsClient(true)
  }, [])

  // レースの予想オッズを取得する関数
  const importRaceOdds = async (raceUrl: string) => {
    try {
      setLoadingRaceId(raceUrl)
      const encodedUrl = encodeURIComponent(raceUrl)
      const response = await axios.get<Array<{ name: string; odds: number }>>(`/api/race-odds/${encodedUrl}`)
      const horseOdds = response.data

      const newOdds = Array(18).fill(1.0)
      const newHorseNames = Array(18).fill('')

      horseOdds.forEach((horse, index) => {
        if (index < 18) {
          newOdds[index] = horse.odds
          newHorseNames[index] = horse.name
        }
      })

      setOdds(newOdds)
      setHorseNames(newHorseNames)
      setStakes(Array(18).fill(100))
      setResults(null)
    } catch (error) {
      console.error('Failed to import odds:', error)
    } finally {
      setLoadingRaceId(null)
    }
  }

  // calculateResults関数
  const calculateResults = () => {
    const includedIndices = stakes.map((s, i) => ({ s, i }))
      .filter(obj => obj.s >= 100)
      .map(obj => obj.i)

    if (includedIndices.length < 3) {
      setResults(null)
      return null
    }

    try {
      const result = calculateResultsForStakes(stakes, odds)
      if (result) {
        setResults(result)
        return result
      } else {
        setResults(null)
        return null
      }
    } catch (error) {
      console.error('Error in calculateResults:', error)
      setResults(null)
      return null
    }
  }

  // handleSubmit関数
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = calculateResults()

    if (result) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } else {
      toast({
        title: '計算できません',
        description: '3頭以上の馬を選択してください（重みを100以上に設定）',
        variant: 'destructive',
      })
    }
  }

  const handleStakeChange = (index: number, value: number) => {
    setStakes(prev => {
      const newArr = [...prev]
      newArr[index] = value
      return newArr
    })
    setResults(null)
  }

  const handleOddChange = (index: number, value: number) => {
    setOdds(prev => {
      const newArr = [...prev]
      newArr[index] = value
      return newArr
    })
    setResults(null)
  }

  const calculateOptimalStakes = async () => {
    try {
      setIsAutoCalculating(true)
      setProgress(null)

      const validHorseIndices = stakes
        .map((stake, index) => ({ stake, index }))
        .filter(({ stake }) => stake >= 100)
        .map(({ index }) => index)

      if (validHorseIndices.length < 3) {
        throw new Error('有効な馬が3頭未満です。重みを100以上に設定した馬を3頭以上選択してください。')
      }

      if (validHorseIndices.length > 8) {
        throw new Error('計算量が多すぎます。重みを100以上に設定した馬を8頭以下に制限してください。')
      }

      const { optimalStakes, optimalResults, maxExpectedValue } = await optimizeStakes(
        validHorseIndices,
        odds,
        (progress, bestValue) => {
          setProgress({
            current: Math.floor(progress * 100),
            total: 100,
            bestValue,
          })
        }
      )

      setOptimalResult({
        stakes: optimalStakes,
        expectedValue: maxExpectedValue,
        weightedReturn: optimalResults.weightedReturn,
        totalStakes: optimalResults.totalStakes,
      })

      setStakes(optimalStakes)
      setResults(optimalResults)

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (error) {
      console.error('Optimization error:', error)

      toast({
        title: '最適化に失敗しました',
        description: error instanceof Error ? error.message : '予期せぬエラーが発生しました',
        variant: 'destructive',
      })

      setOptimalResult(null)
      setProgress(null)
    } finally {
      setIsAutoCalculating(false)
      setProgress(null)
    }
  }

  const resetAll = () => {
    setStakes(Array(18).fill(100))
    setOdds(Array(18).fill(1.0))
    setHorseNames(Array(18).fill(''))
    setResults(null)
    setOptimalResult(null)
  }

  return {
    // State
    step,
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
    optimalResult,
    progress,
    showAllResults,
    setShowAllResults,
    sortedCombinations,

    // Handlers
    handleSort,
    importRaceOdds,
    handleSubmit,
    handleStakeChange,
    handleOddChange,
    calculateOptimalStakes,
    resetAll,
  }
}
