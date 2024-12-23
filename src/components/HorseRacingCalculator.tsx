"use client"

import { useState, ChangeEvent, useMemo, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Calculator, MessageCircleQuestion, ChevronRight, Info, Plus, Minus, Loader2, X } from 'lucide-react'
import { TbHorse } from "react-icons/tb";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import dynamic from 'next/dynamic'
const BlockMath = dynamic(() => import('react-katex').then(mod => mod.BlockMath), {
  ssr: false
})
const InlineMath = dynamic(() => import('react-katex').then(mod => mod.InlineMath), {
  ssr: false
})
import 'katex/dist/katex.min.css'
import { useSwipeable } from 'react-swipeable'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useToast } from "@/components/ui/use-toast"

// コンポーネントの先頭で共通のスタイルを定義
const mathStyle = {
  fontSize: '1em',
  '@media (max-width: 768px)': {
    fontSize: '0.85em'
  }
}

const longMathStyle = {
  fontSize: '1em',
  '@media (max-width: 768px)': {
    fontSize: '0.75em'
  }
}

function combinations<T>(array: T[], r: number): T[][] {
  const result: T[][] = []
  const recurse = (start: number, combo: T[]) => {
    if (combo.length === r) {
      result.push([...combo])
      return
    }
    for (let i = start; i < array.length; i++) {
      combo.push(array[i])
      recurse(i + 1, combo)
      combo.pop()
    }
  }
  recurse(0, [])
  return result
}

// HorseInput コンポーネントを作成
function HorseInput({
  index,
  stake,
  odd,
  horseName,
  onStakeChange,
  onOddChange
}: {
  index: number
  stake: number
  odd: number
  horseName: string
  onStakeChange: (value: number) => void
  onOddChange: (value: number) => void
}) {
  // スライダーの値を管理するためのローカルstate
  const [sliderValue, setSliderValue] = useState(stake)

  // stakeが外部から変更された場合にスライダーの値も更新
  useEffect(() => {
    setSliderValue(stake)
  }, [stake])

  // 重み用のスワイプハンドラー
  const stakeHandlers = useSwipeable({
    onSwipedLeft: () => onStakeChange(Math.max(0, stake - 100)),
    onSwipedRight: () => onStakeChange(stake + 100),
    trackMouse: true
  })

  // オッズ用のスワイプハンドラー
  const oddHandlers = useSwipeable({
    onSwipedUp: () => onOddChange(odd + 0.1),
    onSwipedDown: () => onOddChange(Math.max(1, odd - 0.1)),
    trackMouse: true
  })

  return (
    <div className={`${stake === 0 ? 'bg-gray-100' : 'bg-white'
      } rounded-xl shadow p-3 md:p-4 space-y-2 md:space-y-3 transition-colors duration-200`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] md:text-base font-bold text-white md:text-blue-900 bg-blue-800 md:bg-transparent rounded px-1.5 py-0.5 md:p-0">
          {/* スマホ版は数字のみ、PC版は「番」付き */}
          <span className="md:hidden">{index + 1}</span>
          <span className="hidden md:inline">{index + 1}番</span>
        </span>
        {horseName && (
          <span className="text-sm md:text-base font-bold text-blue-900 truncate ml-2">{horseName}</span>
        )}
      </div>

      <div className="space-y-3 md:space-y-4">
        {/* 重みの入力 */}
        <div className="space-y-1 md:space-y-2">
          <div className="flex items-center gap-0.5 md:gap-2">
            <Label className="text-xs md:text-sm text-gray-600 min-w-[40px] md:min-w-[50px]">重み</Label>
            <div {...stakeHandlers} className="flex-1">
              <Slider
                value={[Math.min(stake, 1000)]}
                onValueChange={(value) => onStakeChange(value[0])}
                min={0}
                max={1000}
                step={100}
                className="w-full"
              />
            </div>
          </div>
          {/* 数値入力と微調整ボタン */}
          <div className="flex items-center gap-1 md:gap-2 justify-end ml-[40px] md:ml-[50px]">
            <div className="hidden md:flex items-center gap-1 md:gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  const newValue = Math.max(0, stake - 100)
                  onStakeChange(newValue)
                }}
                className="w-[60px] md:w-[70px] h-[32px] md:h-[37px]"
              >
                <Minus className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
            <Input
              type="number"
              min={0}
              step={100}
              value={stake}
              onChange={(e) => {
                const value = parseInt(e.target.value)
                if (!isNaN(value) && value >= 0) {
                  onStakeChange(value)
                }
              }}
              onWheel={(e) => {
                e.preventDefault()
                if (document.activeElement === e.currentTarget) {
                  const delta = e.deltaY > 0 ? -100 : 100
                  const newValue = Math.max(0, stake + delta)
                  onStakeChange(newValue)
                }
              }}
              className="text-center w-[70px] md:w-[80px] h-[32px] md:h-[37px] text-sm md:text-base"
            />
            <div className="md:hidden flex flex-col -space-y-px">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  const newValue = stake + 100
                  onStakeChange(newValue)
                }}
                className="w-[32px] h-[16px] rounded-b-none border-b-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  const newValue = Math.max(0, stake - 100)
                  onStakeChange(newValue)
                }}
                className="w-[32px] h-[16px] rounded-t-none"
              >
                <Minus className="h-3 w-3" />
              </Button>
            </div>
            <div className="hidden md:block">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  const newValue = stake + 100
                  onStakeChange(newValue)
                }}
                className="w-[60px] md:w-[70px] h-[32px] md:h-[37px]"
              >
                <Plus className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* オッズの入力 */}
        <div className="space-y-1 md:space-y-2">
          <div className="flex items-center gap-0.5 md:gap-2">
            <Label className="text-xs md:text-sm text-gray-600 min-w-[40px] md:min-w-[50px]">オッズ</Label>
            <div {...oddHandlers} className="flex-1">
              <Slider
                value={[Math.min(odd, 100)]}
                onValueChange={(value) => onOddChange(value[0])}
                min={1.0}
                max={100.0}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>
          {/* 数値入力と微調整ボタン */}
          <div className="flex items-center gap-1 md:gap-2 justify-end ml-[40px] md:ml-[50px]">
            <div className="hidden md:flex items-center gap-1 md:gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onOddChange(Math.max(1, odd - 0.1))}
                className="w-[60px] md:w-[70px] h-[32px] md:h-[37px]"
              >
                <Minus className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
            <Input
              type="number"
              min={1.0}
              step={0.1}
              value={Number(odd).toFixed(1)}
              onChange={(e) => {
                const value = parseFloat(e.target.value)
                if (!isNaN(value) && value >= 1.0) {
                  onOddChange(value)
                }
              }}
              onWheel={(e) => {
                e.preventDefault()
                if (document.activeElement === e.currentTarget) {
                  const delta = e.deltaY > 0 ? -0.1 : 0.1
                  onOddChange(Math.max(1, odd + delta))
                }
              }}
              className="text-center w-[70px] md:w-[80px] h-[32px] md:h-[37px] text-sm md:text-base"
            />
            <div className="md:hidden flex flex-col -space-y-px">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onOddChange(odd + 0.1)}
                className="w-[32px] h-[16px] rounded-b-none border-b-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onOddChange(Math.max(1, odd - 0.1))}
                className="w-[32px] h-[16px] rounded-t-none"
              >
                <Minus className="h-3 w-3" />
              </Button>
            </div>
            <div className="hidden md:block">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onOddChange(odd + 0.1)}
                className="w-[60px] md:w-[70px] h-[32px] md:h-[37px]"
              >
                <Plus className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 型定義を修正
type CombinationResult = {
  horses: number[]
  stake: number
  approximateOdds: number
  expectedReturn: number
  probability: number
}

// 結果の型定義をより具体的に
type CalculationResult = {
  totalStakes: number
  weightedReturn: number
  combinations: CombinationResult[]
  minReturn: {
    value: number
    horses: number[]
    odds: number
  }
  maxReturn: {
    value: number
    horses: number[]
    odds: number
  }
}

// ソート設定の型定義
type SortConfig = {
  key: keyof CombinationResult;
  direction: 'asc' | 'desc';
} | null;

// 型定義を追加
type Race = {
  name: string
  url: string
  date: string
}

type HorseOdds = {
  name: string
  odds: number
}

// APIレスポンスの型を定義
type RaceResponse = {
  races: Race[]
}

// 型定義を追加
type OptimizationProgress = {
  current: number
  total: number
  bestValue: number
}

// 計算関数を分離して純粋関数化
const calculateResultsForStakes = (
  currentStakes: number[],
  odds: number[]
): CalculationResult | null => {
  try {
    // 選択された馬のインデックスを抽出（重みが100以上の馬）
    const includedIndices = currentStakes.map((s, i) => ({ s, i }))
      .filter(obj => obj.s >= 100)
      .map(obj => obj.i)

    // 3頭未満の場合はnullを返す
    if (includedIndices.length < 3) {
      return null
    }

    // 選択された馬の掛け金とオッズを抽出
    const includedStakes = includedIndices.map(i => currentStakes[i])
    const includedOdds = includedIndices.map(i => odds[i])

    // 生の確率を計算 (オッズから逆算、0.8は単勝市場の払戻率)
    const p_raw = includedOdds.map(o => 0.8 / o)
    const sum_p_raw = p_raw.reduce((acc, v) => acc + v, 0)
    const p_norm = p_raw.map(v => v / sum_p_raw)

    // 3頭組み合わせの配列を生成
    const combosStakes = combinations(includedStakes, 3)
    const combosOdds = combinations(includedOdds, 3)
    const combosPnorm = combinations(p_norm, 3)

    let totalStakesAllCombos = 0
    let sumD = 0
    let sumWeightedReturn = 0

    const combinationResults: CombinationResult[] = []

    // 各組み合わせについて計算
    for (let c = 0; c < combosStakes.length; c++) {
      const comboStakes = combosStakes[c]
      const comboP = combosPnorm[c]

      const horses = includedIndices.filter((_, idx) =>
        combinations(Array.from({ length: includedIndices.length }, (_, i) => i), 3)[c].includes(idx)
      )

      const comboStakeSum = comboStakes.reduce((sum, val) => sum + val, 0)
      const P_ijk_raw = comboP.reduce((prod, p) => prod * p, 1)

      const combo = {
        horses: horses.map(i => i + 1),
        stake: comboStakeSum,
        expectedReturn: 0,
        approximateOdds: 0,
        probability: P_ijk_raw
      }

      combinationResults.push(combo)
    }

    const totalProb = combinationResults.reduce((sum, c) => sum + c.probability, 0)

    // 確率を正規化して期待リターンとオッズを計算
    for (const combo of combinationResults) {
      const P_ijk = combo.probability / totalProb
      const trifectaOdds = 0.75 / P_ijk
      const comboReturn = combo.stake * trifectaOdds

      combo.probability = P_ijk
      combo.approximateOdds = trifectaOdds
      combo.expectedReturn = comboReturn

      totalStakesAllCombos += combo.stake
      sumD += P_ijk
      sumWeightedReturn += comboReturn * P_ijk
    }

    const weightedReturn = sumD > 0 ? sumWeightedReturn / sumD : 0

    const minReturn = Math.min(...combinationResults.map(c => c.expectedReturn))
    const maxReturn = Math.max(...combinationResults.map(c => c.expectedReturn))
    const minReturnCombo = combinationResults.find(c => c.expectedReturn === minReturn)
    const maxReturnCombo = combinationResults.find(c => c.expectedReturn === maxReturn)

    return {
      totalStakes: totalStakesAllCombos,
      weightedReturn: weightedReturn,
      combinations: combinationResults,
      minReturn: {
        value: minReturn,
        horses: minReturnCombo?.horses || [],
        odds: minReturnCombo?.approximateOdds || 0
      },
      maxReturn: {
        value: maxReturn,
        horses: maxReturnCombo?.horses || [],
        odds: maxReturnCombo?.approximateOdds || 0
      }
    }
  } catch (error) {
    console.error('Error in calculateResultsForStakes:', error)
    return null
  }
}

// 最適化計算を行うワーカー関数
const optimizeStakes = async (
  validHorseIndices: number[],
  odds: number[],
  onProgress: (progress: number, bestValue: number) => void
): Promise<{
  optimalStakes: number[],
  optimalResults: CalculationResult,
  maxExpectedValue: number,
  allPatterns: { pattern: number[], expectedValue: number, horses: number[] }[]
}> => {
  // 3頭未満の場合はエラーをスロー
  if (validHorseIndices.length < 3) {
    throw new Error('3頭以上の馬を選択してください')
  }

  // 重みは100から1000まで100刻み
  const weights = Array.from({ length: 10 }, (_, i) => (i + 1) * 100)
  const totalPatterns = Math.pow(weights.length, validHorseIndices.length)
  let currentPattern = 0

  let maxExpectedValue = -Infinity
  let optimalStakes = Array(18).fill(0)
  let optimalResults: CalculationResult | null = null

  // パバッグ用の配列
  const allPatterns: {
    pattern: number[],
    expectedValue: number,
    horses: number[]
  }[] = []

  // パターンを生成して探索
  const patterns = Array.from(generatePatterns(validHorseIndices.length, weights))

  for (const pattern of patterns) {
    // 現在の重みパターンを生成
    const currentStakes = Array(18).fill(0)
    validHorseIndices.forEach((horseIndex, i) => {
      currentStakes[horseIndex] = pattern[i]
    })

    // この重みパターンでの結果を計算
    const currentResults = calculateResultsForStakes(currentStakes, odds)

    // 結果がnullでない場合のみ評価
    if (currentResults) {
      const expectedValue = currentResults.weightedReturn / currentResults.totalStakes

      // デバッグ用の情報を保存
      allPatterns.push({
        pattern: pattern,
        expectedValue: expectedValue,
        horses: validHorseIndices.map(i => i + 1)
      })

      if (expectedValue > maxExpectedValue) {
        maxExpectedValue = expectedValue
        optimalStakes = [...currentStakes]
        optimalResults = currentResults
      }
    }

    // 進捗を更新（1000パターンごと）
    currentPattern++
    if (currentPattern % 1000 === 0) {
      onProgress(currentPattern / totalPatterns, maxExpectedValue)
      // UIの更新を待つ
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }

  // 全パターンをソートして出力
  const sortedPatterns = allPatterns.sort((a, b) => b.expectedValue - a.expectedValue)

  // 有効な結果が見つからなかった場合はエラー
  if (!optimalResults) {
    throw new Error('有効な組み合わせが見つかりませんでした')
  }

  return {
    optimalStakes,
    optimalResults: optimalResults!,
    maxExpectedValue,
    allPatterns: sortedPatterns
  }
}

// パターン生成関数
function* generatePatterns(length: number, weights: number[]): Generator<number[]> {
  const pattern = new Array(length).fill(weights[0])
  yield [...pattern]

  while (true) {
    let pos = length - 1
    while (pos >= 0) {
      const currentIndex = weights.indexOf(pattern[pos])
      if (currentIndex < weights.length - 1) {
        pattern[pos] = weights[currentIndex + 1]
        for (let i = pos + 1; i < length; i++) {
          pattern[i] = weights[0]
        }
        break
      }
      pos--
    }
    if (pos < 0) break
    yield [...pattern]
  }
}

// 定数を追加
const RESULTS_PER_PAGE = {
  mobile: 20,
  desktop: 21
}

// useMediaQueryフックを追加
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    const listener = () => setMatches(media.matches)
    media.addListener(listener)
    return () => media.removeListener(listener)
  }, [matches, query])

  return matches
}

export default function TrifectaReturnCalculator() {
  const [step, setStep] = useState(0)
  const [stakes, setStakes] = useState<number[]>([])
  const [odds, setOdds] = useState<number[]>([])
  const [horseNames, setHorseNames] = useState<string[]>([])
  const [isClient, setIsClient] = useState(false)
  const [results, setResults] = useState<CalculationResult | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null);
  const [displayMode, setDisplayMode] = useState<'card' | 'table'>('table');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'horses',
    direction: 'asc'
  });
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
  const isDesktop = useMediaQuery('(min-width: 768px)') // md breakpoint

  // ソート関数
  const handleSort = (key: keyof CombinationResult) => {
    setSortConfig((currentConfig) => {
      if (!currentConfig || currentConfig.key !== key) {
        return { key, direction: 'asc' };
      }
      // 同じキーの場合は昇順/降順を切り替えるだけ
      return { key, direction: currentConfig.direction === 'asc' ? 'desc' : 'asc' };
    });
  };

  // ソートされた結果を取得
  const sortedCombinations = useMemo(() => {
    if (!results || !sortConfig) return results?.combinations || [];

    return [...results.combinations].sort((a, b) => {
      // 馬番組み合わせでソートする場合
      if (sortConfig.key === 'horses') {
        const aStr = a.horses.join('-');
        const bStr = b.horses.join('-');
        return sortConfig.direction === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      }

      // その他の数値項目でソート
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      return sortConfig.direction === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number);
    });
  }, [results, sortConfig]);

  useEffect(() => {
    setStakes(Array(18).fill(100))
    setOdds(Array(18).fill(1.0))
    setHorseNames(Array(18).fill(''))
    setIsClient(true)
  }, [])

  // レース情報の取得
  const { data: raceData, error: raceError } = useQuery<RaceResponse>({
    queryKey: ['recentGradeRace'],
    queryFn: async () => {
      try {
        const response = await axios.get('/api/recent-grade-race')
        console.log('Race data response:', response.data) // デバッグ用
        return response.data
      } catch (error) {
        console.error('Failed to fetch race data:', error)
        throw error
      }
    }
  })

  // エラー表示を追加
  if (raceError) {
    console.error('Race data error:', raceError)
  }

  // レースの予想オッズを取得する関数を修正
  const importRaceOdds = async (raceUrl: string) => {
    try {
      setLoadingRaceId(raceUrl) // ローディング開始
      const encodedUrl = encodeURIComponent(raceUrl)
      const response = await axios.get<Array<{ name: string; odds: number }>>(`/api/race-odds/${encodedUrl}`)
      const horseOdds = response.data

      const newOdds = Array(18).fill(1.0)
      const newHorseNames = Array(18).fill('')

      // 取得したオッズを設定
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
      setLoadingRaceId(null) // ローディング終了
    }
  }

  if (!isClient) {
    return <div>Loading...</div>
  }

  // calculateResults関数を修正
  const calculateResults = () => {
    // 選択された馬のインデックスを抽出（重みが100以上の馬）
    const includedIndices = stakes.map((s, i) => ({ s, i }))
      .filter(obj => obj.s >= 100)
      .map(obj => obj.i)

    // 3頭未満の場合はnullを返す
    if (includedIndices.length < 3) {
      setResults(null)
      return null
    }

    try {
      const result = calculateResultsForStakes(stakes, odds)
      if (result) {
        setResults(result)  // 結果をstateに設定
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

  // handleSubmit関数を修正
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const result = calculateResults()

    if (result) {
      // 計算結果までスクロール
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } else {
      // 結果がない場合はエラーメッセージを表示
      toast({
        title: "計算できません",
        description: "3頭以上の馬を選択してください（重みを100以上に設定）",
        variant: "destructive",
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

      // 有効な馬を抽出（重みが100以上の馬）
      const validHorseIndices = stakes
        .map((stake, index) => ({ stake, index }))
        .filter(({ stake }) => stake >= 100)
        .map(({ index }) => index)

      // エラーメッセージを修正
      if (validHorseIndices.length < 3) {
        throw new Error('有効な馬が3頭未満です。重みを100以上に設定した馬を3頭以上選択してください。')
      }

      if (validHorseIndices.length > 6) {
        throw new Error('計算量が多すぎます。重みを100以上に設定した馬を6頭以下に制限してください。')
      }

      // 最適化の実行
      const { optimalStakes, optimalResults, maxExpectedValue } = await optimizeStakes(
        validHorseIndices,
        odds,
        (progress, bestValue) => {
          setProgress({
            current: Math.floor(progress * 100),
            total: 100,
            bestValue
          })
        }
      )

      // 結果の保存
      setOptimalResult({
        stakes: optimalStakes,
        expectedValue: maxExpectedValue,
        weightedReturn: optimalResults.weightedReturn,
        totalStakes: optimalResults.totalStakes
      })

      // 最適な重みを画面に反映
      setStakes(optimalStakes)
      setResults(optimalResults)

      // 計算結果までスクロール
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)

    } catch (error) {
      console.error('Optimization error:', error)

      // エラーメッセージをユーザーに表示
      toast({
        title: "最適化に失敗しました",
        description: error instanceof Error ? error.message : "予期せぬエラーが発生しました",
        variant: "destructive",
      })

      // エラー時は状態をリセット
      setOptimalResult(null)
      setProgress(null)

    } finally {
      setIsAutoCalculating(false)
      setProgress(null)
    }
  }

  // 組み合わせの詳細情報を計算する補助関数
  const calculateCombinationsDetails = (currentStakes: number[]): CombinationResult[] => {
    const includedIndices = currentStakes.map((s, i) => ({ s, i }))
      .filter(obj => obj.s >= 100)
      .map(obj => obj.i)

    const includedStakes = includedIndices.map(i => currentStakes[i])
    const includedOdds = includedIndices.map(i => odds[i])

    // 単勝確率の計算と正規化
    const p_raw = includedOdds.map(o => 0.8 / o)  // オッズから確率を逆算
    const sum_p_raw = p_raw.reduce((acc, v) => acc + v, 0)
    const p_norm = p_raw.map(v => v / sum_p_raw)  // 確率の正規化

    const combos = combinations(Array.from({ length: includedIndices.length }, (_, i) => i), 3)
    const results: CombinationResult[] = []

    for (const combo of combos) {
      const horses = combo.map(i => includedIndices[i] + 1)
      const comboStakes = combo.map(i => includedStakes[i])
      const comboP = combo.map(i => p_norm[i])

      const stakeSum = comboStakes.reduce((sum, v) => sum + v, 0)
      const P_ijk = comboP.reduce((prod, p) => prod * p, 1)

      // 3連複オッズを計算（払戻率75%）
      const trifectaOdds = 0.75 / P_ijk

      results.push({
        horses,
        stake: stakeSum,
        expectedReturn: stakeSum * trifectaOdds,
        approximateOdds: trifectaOdds,
        probability: P_ijk,
      })
    }

    return results
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
        <Card className="mb-10 shadow-2xl border-0 rounded-xl overflow-hidden">
          <CardHeader className="bg-blue-500 py-4">
            <CardTitle className="flex items-center space-x-3 text-xl md:text-2xl text-white">
              <TbHorse className="h-6 w-6 md:h-8 md:w-8 text-white" />
              <span>どういうツール？</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 md:p-8">
            <div className="space-y-4">
              <p>
                このツールは、<strong>3連複馬券の買い目を分析・評価する</strong>ためのシミュレーターです。
                各馬の単勝オッズと設定した重みから、理論的な期待リターンを計算し、
                どの組み合わせに投資価値があるかを判断するための指標を提供します。
              </p>
              <div className="rounded-xl bg-blue-100/50 p-4 md:p-6 space-y-3">
                <h4 className="text-[16px] md:text-lg font-medium text-blue-900">主なポイント</h4>
                <div className="space-y-1">
                  <p>・単勝オッズから3連複の理論オッズを予測</p>
                  <p>・重みづけによる買い目の調整が可能</p>
                  <p>・全組み合わせの期待リターンを一括計算</p>
                </div>
              </div>
              <div className="rounded-xl bg-blue-100/50 p-4 md:p-6 space-y-3">
                <h4 className="text-[16px] md:text-lg font-medium text-blue-900">使い方</h4>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>各馬の重みを設定（重視したい馬は重みを大きく）</li>
                  <li>単勝オッズを入力（レース選択でインポート可能）</li>
                  <li>計算ボタンを押して結果を確認</li>
                </ol>
              </div>
              <p className="text-sm text-gray-600">
                ※このツールは理論的な計算に基づく参考値を提供するものであり、
                実際の馬券的中や利益を保証するものではありません。
              </p>
            </div>
          </CardContent>
        </Card>

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
            {raceData?.races && (
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
                  {raceData.races.length > 0 ? (
                    raceData.races.map((race) => (
                      <button
                        key={race.date}
                        type="button"
                        onClick={() => importRaceOdds(race.url)}
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
            )}

            {/* 説明文 */}
            <p className="text-sm text-gray-600 mb-3">
              自動最適化機能は、各馬の重みを自動で調整し、期待値が最も高くなる組み合わせを探索します。
              計算には時間がかかる場合があります。
            </p>

            {/* ボタン群 */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
              <Button
                type="button"
                disabled={false}
                onClick={() => {
                  if (isAutoCalculating) {
                    // 最適化を中止
                    setIsAutoCalculating(false)
                    // 必要に応じて他のクリーンアップ処理
                  } else {
                    calculateOptimalStakes()
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
                      {progress ?
                        `最適化中... ${Math.round(progress.current / progress.total * 100)}%（クリックで中止）` :
                        '最適化中...（クリックで中止）'}
                    </span>
                  </div>
                ) : (
                  '自動最適化を実行'
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setStakes(Array(18).fill(100))
                  setOdds(Array(18).fill(1.0))
                  setHorseNames(Array(18).fill(''))
                  setResults(null)
                  setOptimalResult(null)
                }}
                className="w-full md:w-auto text-gray-600 hover:text-gray-800"
              >
                <X className="h-4 w-4 mr-2" />
                全ての設定をリセット
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-6">
                {/* 馬の入力フォーム */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 max-w-6xl mx-auto">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <HorseInput
                      key={i}
                      index={i}
                      stake={stakes[i]}
                      odd={odds[i]}
                      horseName={horseNames[i]}
                      onStakeChange={(value) => handleStakeChange(i, value)}
                      onOddChange={(value) => handleOddChange(i, value)}
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

        {results && (
          <Card className="mb-10 overflow-hidden border-2 border-blue-400 shadow-xl" ref={resultsRef}>
            <CardHeader className="bg-blue-500 py-4">
              <CardTitle className="text-2xl text-white">
                <span>計算結果</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-5 md:p-8 bg-white">
              <div className="rounded-xl border p-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {/* 左側の概要部分の行間を狭く */}
                  <div className="space-y-1">  {/* space-y-2 から space-y-1 に変更 */}
                    <p className="text-sm md:text-base">
                      総組合せ数: <span className="text-base md:text-base font-bold">{results.combinations.length}</span> 通り
                    </p>
                    <p className="text-sm md:text-base">
                      総掛け金: <span className="text-base md:text-base font-bold">{Math.round(results.totalStakes).toLocaleString()}</span> 円
                    </p>
                    <p className="text-sm md:text-base">
                      難易度加重期待リターン: <span className="text-base md:text-base font-bold">{Math.round(results.weightedReturn).toLocaleString()}</span> 円
                    </p>
                    <p className="text-sm md:text-base">
                      期待値: <span className="text-base md:text-base font-bold">{(results.weightedReturn / results.totalStakes).toFixed(2)}</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-blue-600">最小期待リターン:</p>
                      <p className="font-bold">{Math.round(results.minReturn.value).toLocaleString()}円</p>
                      <p className="text-sm text-gray-600">
                        組合せ: {results.minReturn.horses.join('-')} (オッズ: {results.minReturn.odds.toFixed(1)})
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-600">最大期待リターン:</p>
                      <p className="font-bold">{Math.round(results.maxReturn.value).toLocaleString()}円</p>
                      <p className="text-sm text-gray-600">
                        組合せ: {results.maxReturn.horses.join('-')} (オッズ: {results.maxReturn.odds.toFixed(1)})
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">買い目と期待リターン</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDisplayMode(prev => prev === 'table' ? 'card' : 'table')
                      setShowAllResults(false)  // 表示モード切り替え時にリセット
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {displayMode === 'table' ? 'カード表示' : 'テーブル表示'}
                  </Button>
                </div>

                {displayMode === 'table' ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-base md:text-lg">
                      <thead>
                        <tr className="bg-blue-50/80">
                          {[
                            { key: 'horses', label: '組合せ' },
                            { key: 'stake', label: '掛け金' },
                            { key: 'approximateOdds', label: '予想オッズ' },
                            { key: 'expectedReturn', label: '期待リターン' },
                            {
                              key: 'probability',
                              label: (
                                <div className="flex items-center gap-1">
                                  確率
                                  <div className="hidden md:block">
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Info className="h-4 w-4 text-blue-500" />
                                        </TooltipTrigger>
                                        <TooltipContent className="text-left max-w-[300px] p-3 text-sm font-normal">
                                          確率は、モデルの仮定（独立性や単純な積の確率）に強く依存するため、出走頭数が少ないほど歪みが大きくなる傾向があります。
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </div>
                                </div>
                              )
                            }
                          ].map(({ key, label }) => (
                            <th
                              key={key}
                              onClick={() => handleSort(key as keyof CombinationResult)}
                              className={`
                                cursor-pointer p-2 md:p-3 text-left text-sm md:text-base font-medium text-gray-600
                                hover:text-blue-600 transition-colors duration-200
                                ${key === 'horses' ? 'text-left' : 'text-right'}
                              `}
                            >
                              <div className="flex items-center gap-1 justify-end">
                                {label}
                                {sortConfig?.key === key && (
                                  <span className="text-blue-600">
                                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                  </span>
                                )}
                              </div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sortedCombinations
                          .slice(0, showAllResults ? undefined : RESULTS_PER_PAGE.desktop)
                          .map((combo, index) => (
                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50/50">
                              <td className="text-left p-[5px] md:px-[10px] md:py-[6px] text-xs md:text-base">
                                {combo.horses.join('-')}
                              </td>
                              <td className="text-right p-[5px] md:px-[10px] md:py-[6px] text-xs md:text-base">
                                {combo.stake.toLocaleString()}<span className="text-[10px] md:text-[14px]">円</span>
                              </td>
                              <td className="text-right p-[5px] md:px-[10px] md:py-[6px] text-xs md:text-base">
                                {combo.approximateOdds.toFixed(1)}
                              </td>
                              <td className="text-right p-[5px] md:px-[10px] md:py-[6px] text-xs md:text-base">
                                {Math.round(combo.expectedReturn).toLocaleString()}<span className="text-[10px] md:text-[14px]">円</span>
                              </td>
                              <td className="text-right p-[5px] md:px-[10px] md:py-[6px] text-xs md:text-base">
                                {(combo.probability * 100).toFixed(2)}<span className="text-[10px] md:text-[14px]">%</span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>

                    {/* 「もっと見る」ボタン */}
                    {!showAllResults && sortedCombinations.length > RESULTS_PER_PAGE.desktop && (
                      <div className="flex justify-center mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowAllResults(true)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          残り{sortedCombinations.length - RESULTS_PER_PAGE.desktop}件を表示
                        </Button>
                      </div>
                    )}

                    {/* 全件表示時の「折りたたむ」ボタン */}
                    {showAllResults && sortedCombinations.length > RESULTS_PER_PAGE.desktop && (
                      <div className="flex justify-center mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowAllResults(false)
                            // 折りたたむ時にスクロール位置を調整
                            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          表示を折りたたむ
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {results.combinations
                      .slice(0, showAllResults ? undefined : (isDesktop ? RESULTS_PER_PAGE.desktop : RESULTS_PER_PAGE.mobile))
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

                    {/* 「もっと見る」ボタン */}
                    {!showAllResults && results.combinations.length > (isDesktop ? RESULTS_PER_PAGE.desktop : RESULTS_PER_PAGE.mobile) && (
                      <div className="col-span-full flex justify-center mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowAllResults(true)}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          残り{results.combinations.length - (isDesktop ? RESULTS_PER_PAGE.desktop : RESULTS_PER_PAGE.mobile)}件を表示
                        </Button>
                      </div>
                    )}

                    {/* 折りたたむボタン */}
                    {showAllResults && results.combinations.length > (isDesktop ? RESULTS_PER_PAGE.desktop : RESULTS_PER_PAGE.mobile) && (
                      <div className="col-span-full flex justify-center mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowAllResults(false)
                            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          表示を折りたたむ
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-10 shadow-2xl border-0 rounded-xl overflow-hidden">
          <CardHeader className="bg-blue-500 py-4">
            <CardTitle className="flex items-center space-x-3 text-xl md:text-2xl text-white">
              <MessageCircleQuestion className="h-6 w-6 md:h-8 md:w-8 text-white" />
              <span>なぜこの結果になるの？</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-5 md:p-8 bg-white">
            <div className="space-y-6">

              {/* 説明部分を更新 */}
              <section className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-800">文系でもわかる仕組みの概要</h3>
                <div className="space-y-4">
                  <div className="rounded-xl bg-blue-100/50 p-4 md:p-6 space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-[16px] md:text-lg font-medium text-blue-900">1. 3着以内に入る確率を予測</h4>
                      <p>
                        単勝オッズは、その馬が1着になる可能性を表しています。
                        つまり、オッズが低い馬ほど能力が高く評価されているということです。
                      </p>
                      <p>
                        このツールでは、単勝オッズから各馬が3着以内に入る確率を予測します。
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-[16px] md:text-lg font-medium text-blue-900">2. 組み合わせの評価</h4>
                      <p>
                        3頭の組み合わせごとに、以下の要素を計算します。
                        <ul className="list-disc list-inside mt-2 ml-4">
                          <li>その組み合わせが的中する確率</li>
                          <li>予想される3連複オッズ</li>
                          <li>掛け金に対する期待リターン（払戻金額）</li>
                        </ul>
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-[16px] md:text-lg font-medium text-blue-900">3. 買い目のシミュレーション</h4>
                      <p>
                        計算結果を「期待リターン」と「当たりやすさ」の両面から評価し、買い目全体で見た期待リターンと期待値を提示します。重みの設定により、特定の馬を重視した計算が可能です。
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 期待リターンの計算方法 */}
              <section className="space-y-4 !mt-10">
                <h3 className="text-xl font-semibold text-blue-800">期待リターンの計算方法</h3>
                <p>前提として、以下の理論的な仮定と近似に基づいて計算を行っています。</p>

                <div className="space-y-6">
                  {/* 3着以内の確率の近似 */}
                  <div className="rounded-xl bg-blue-100/50 p-4 md:p-6 space-y-3">
                    <h4 className="text-[16px] md:text-lg font-medium text-blue-900">近似➀：3着以内に入る確率の近似</h4>
                    <p>
                      単勝オッズは「1着になる確率」を反映していますが、3連複では「3着以内に入る確率」が必要です。そこで、各馬の3着以内確率は単勝確率に比例すると仮定します。
                    </p>
                    <div className="overflow-x-auto">
                      <div className="w-full"> {/* min-w-[XXXpx]を削除し、w-fullに変更 */}
                        <BlockMath
                          math="P_i = C_i \times p_i"
                          style={mathStyle}
                        />
                      </div>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-xl space-y-2">
                      <ul className="list-disc list-inside space-y-1 ml-4 [&>li]:marker:mr-[10px]">
                        <li><InlineMath math="P_i" />：<InlineMath math="i" />番の馬の3着以内確率</li>
                        <li><InlineMath math="C_i" />：<InlineMath math="i" />番の馬の比例定数</li>
                      </ul>
                    </div>
                    <p>
                      この<InlineMath math="C_i" />の値は馬によって差がありますが、ここではどの馬も等しく<InlineMath math="C" />であると仮定します。よって
                    </p>
                    <div className="overflow-x-auto">
                      <div className="w-full"> {/* min-w-[XXXpx]を削除し、w-fullに変更 */}
                        <BlockMath
                          math="P_i = C \times p_i"
                          style={mathStyle}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3頭組の同時確率 */}
                  <div className="rounded-xl bg-blue-100/50 p-4 md:p-6 space-y-3">
                    <h4 className="text-[16px] md:text-lg font-medium text-blue-900">近似➁：3頭組の同時確率の近似</h4>
                    <p>
                      3頭が同時に3着以内に入る確率は、単純な独立事象ではありません。
                      しかし、計算を簡略化するために、3頭の着順は考慮せず、3着以内に入る順不同の組み合わせとして扱います。さらに、各馬の3着以内確率を独立と仮定して積を取ります。実際には馬同士の相関があるため、これは近似的な取り扱いとなります。
                    </p>
                  </div>

                </div>

                {/* 既存の計算ステップの説明 */}
                <p className="mt-8">これらの近似を踏まえ、具体的な計算手順は以下の通りです。</p>
                <ol className="list-decimal space-y-8 [&>li]:ml-[1.5em] [&>li]:pl-[0.5em]">
                  <li className="font-medium">単勝オッズから各馬の理論的な勝率を推定</li>
                </ol>

                <div className="space-y-3">
                  <div className="overflow-x-auto">
                    <div className="w-full"> {/* min-w-[XXXpx]を削除し、w-fullに変更 */}
                      <BlockMath
                        math="p_i = \frac{0.8}{o_i}"
                        style={mathStyle}
                      />
                    </div>
                  </div>
                  <div className="bg-gray-100/80 p-4 rounded-xl space-y-2">
                    <ul className="list-disc list-inside space-y-1 ml-4 [&>li]:marker:mr-[10px]">
                      <li><InlineMath math="p_i" />：<InlineMath math="i" />番の馬の推定勝率</li>
                      <li><InlineMath math="o_i" />：<InlineMath math="i" />番の馬の単勝オッズ</li>
                      <li>0.8は払戻率80%を表します。</li>
                    </ul>
                  </div>
                </div>

                <ol className="list-decimal space-y-8 [&>li]:ml-[1.5em] [&>li]:pl-[0.5em]" start={2}>
                  <li className="font-medium">推定勝率を正規化（全馬の勝率の合計を1にする）</li>
                </ol>

                <div className="space-y-3">
                  <p>全馬の勝率の合計が100%になるように調整します。</p>
                  <div className="overflow-x-auto">
                    <div className="w-full"> {/* min-w-[XXXpx]を削除し、w-fullに変更 */}
                      <BlockMath
                        math="p_{i\_\text{norm}} = \frac{p_i}{\sum p_i}"
                        style={mathStyle}
                      />
                    </div>
                  </div>
                  <div className="bg-gray-100/80 p-4 rounded-xl">
                    <ul className="list-disc list-inside space-y-1 ml-4 [&>li]:marker:mr-[10px]">
                      <li><InlineMath math="p_{i\_\text{norm}}" />：<InlineMath math="i" />番の馬の正規化後の勝率</li>
                    </ul>
                  </div>
                </div>

                <ol className="list-decimal space-y-8 [&>li]:ml-[1.5em] [&>li]:pl-[0.5em]" start={3}>
                  <li className="font-medium">3頭の組み合わせが的中する確率を計算</li>
                </ol>

                <div className="space-y-3">
                  <p>近似➀より、<InlineMath math="i" />番の馬が3着以内に入る確率は次のようになります。</p>
                  <div className="overflow-x-auto">
                    <div className="w-full"> {/* min-w-[XXXpx]を削除し、w-fullに変更 */}
                      <BlockMath
                        math="P_i = C \times p_{i\_\text{norm}}"
                        style={mathStyle}
                      />
                    </div>
                  </div>
                  <p>近似➁より、各3頭組み合わせ<InlineMath math="(i, j, k)" />の的中確率を、3着以内確率の積として計算します。</p>
                  <div className="overflow-x-auto">
                    <div className="w-full"> {/* min-w-[XXXpx]を削除し、w-fullに変更 */}
                      <BlockMath
                        math="\begin{align*} P_{ijk} &= P_i \times P_j \times P_k \\ &= D \times p_{i\_\text{norm}} \times p_{j\_\text{norm}} \times p_{k\_\text{norm}} \end{align*}"
                        style={longMathStyle}
                      />
                    </div>
                  </div>
                  <div className="bg-gray-100/80 p-4 rounded-xl">
                    <ul className="list-disc list-inside space-y-1 ml-4 [&>li]:marker:mr-[10px]">
                      <li><InlineMath math="P_{ijk}" />：各3頭組み合わせ<InlineMath math="(i, j, k)" />の的中確率</li>
                      <li><InlineMath math="D" />：比例定数<InlineMath math="(=C^3)" /></li>
                    </ul>
                  </div>
                </div>

                <ol className="list-decimal space-y-8 [&>li]:ml-[1.5em] [&>li]:pl-[0.5em]" start={4}>
                  <li className="font-medium">確率の正規化</li>
                </ol>

                <div className="space-y-3">
                  <p>全組み合わせの確率の合計が100%になるように調整します。ここで、比例定数<InlineMath math="D" />は相殺されるため、今後の計算には影響しません。</p>
                  <div className="overflow-x-auto">
                    <div className="w-full"> {/* min-w-[XXXpx]を削除し、w-fullに変更 */}
                      <BlockMath
                        math="P_{ijk\_\text{norm}} = \frac{P_{ijk}}{\sum P_{ijk}}"
                        style={mathStyle}
                      />
                    </div>
                  </div>
                  <div className="bg-gray-100/80 p-4 rounded-xl">
                    <ul className="list-disc list-inside space-y-1 ml-4 [&>li]:marker:mr-[10px]">
                      <li><InlineMath math="P_{ijk\_\text{norm}}" />：各3頭組み合わせ（i, j, k）の正規化後の的中確率</li>
                    </ul>
                  </div>
                </div>

                <ol className="list-decimal space-y-8 [&>li]:ml-[1.5em] [&>li]:pl-[0.5em]" start={5}>
                  <li className="font-medium">3連複オッズの推定</li>
                </ol>

                <div className="space-y-3">
                  <p>確率が低いほどオッズは高くなり、確率が高いほどオッズは低くなります。</p>
                  <div className="overflow-x-auto">
                    <div className="w-full"> {/* min-w-[XXXpx]を削除し、w-fullに変更 */}
                      <BlockMath
                        math="O_{ijk} = \frac{0.75}{P_{ijk\_\text{norm}}}"
                        style={mathStyle}
                      />
                    </div>
                  </div>
                  <div className="bg-gray-100/80 p-4 rounded-xl space-y-2">
                    <ul className="list-disc list-inside space-y-1 ml-4 [&>li]:marker:mr-[10px]">
                      <li><InlineMath math="O_{ijk}" />：各3頭組み合わせ<InlineMath math="(i, j, k)" />の3連複オッズ</li>
                      <li>0.75は3連複の払戻率75%を表します。</li>
                    </ul>
                  </div>
                </div>

                <ol className="list-decimal space-y-8 [&>li]:ml-[1.5em] [&>li]:pl-[0.5em]" start={6}>
                  <li className="font-medium">期待リターンの計算</li>
                </ol>

                <div className="space-y-3">
                  <p>各組み合わせの掛け金に3連複オッズを掛けることで、その組み合わせで期待できるリターン（払戻金額）を計算します。</p>
                  <div className="overflow-x-auto">
                    <div className="w-full"> {/* min-w-[XXXpx]を削除し、w-fullに変更 */}
                      <BlockMath
                        math="R_{ijk} = S_{ijk} \times O_{ijk}"
                        style={mathStyle}
                      />
                    </div>
                  </div>
                  <div className="bg-gray-100/80 p-4 rounded-xl">
                    <ul className="list-disc list-inside space-y-1 ml-4 [&>li]:marker:mr-[10px]">
                      <li><InlineMath math="R_{ijk}" />：各3頭組み合わせ<InlineMath math="(i, j, k)" />の3連複期待リターン</li>
                      <li><InlineMath math="S_{ijk}" />：各3頭組み合わせ<InlineMath math="(i, j, k)" />への掛け金</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 難易度加重について */}
              <section className="space-y-4 !mt-10">
                <h3 className="text-xl font-semibold text-blue-800">難易度加重と期待値について</h3>
                <ol className="list-decimal space-y-8 [&>li]:ml-[1.5em] [&>li]:pl-[0.5em]" start={7}>
                  <li className="font-medium">難易度加重の考え方</li>
                </ol>

                <div className="space-y-4">
                  <p>
                    単純な期待リターンだけでなく、「当たりやすさ」も考慮して評価を行います。
                    これを「難易度加重」と呼んでいます。
                  </p>
                  <p>
                    的中確率が高い（＝当たりやすい）組み合わせほど<InlineMath math="P_{ijk\_\text{norm}}" />は大きくなり、
                    最終的な評価により大きく反映されます。これにより、現実的な組み合わせがより高く評価されます。
                  </p>
                  <div className="overflow-x-auto">
                    <div className="w-full"> {/* min-w-[XXXpx]を削除し、w-fullに変更 */}
                      <BlockMath
                        math="\begin{align*}
                          R &= \frac{\sum (R_{ijk} \times P_{ijk\_\text{norm}})}{\sum P_{ijk\_\text{norm}}} \\
                            &= {\sum (R_{ijk} \times P_{ijk\_\text{norm}})} \quad (∵{\sum P_{ijk\_\text{norm}}} = 1)
                          \end{align*}"
                        style={longMathStyle}
                      />
                    </div>
                  </div>
                  <div className="rounded-xl bg-gray-100/80 p-4 space-y-3">
                    <ul className="list-disc list-inside space-y-1 ml-4 [&>li]:marker:mr-[10px]">
                      <li><InlineMath math="R" />：難易度加重期待リターン</li>
                    </ul>
                  </div>
                </div>

                <ol className="list-decimal space-y-8 [&>li]:ml-[1.5em] [&>li]:pl-[0.5em]" start={8}>
                  <li className="font-medium">期待値の計算</li>
                </ol>

                <div className="space-y-4">
                  <p>
                    難易度を考慮した最終的な期待値を計算します。
                  </p>
                  <div className="overflow-x-auto">
                    <div className="w-full"> {/* min-w-[XXXpx]を削除し、w-fullに変更 */}
                      <BlockMath
                        math="EV = \frac{R}{\sum S_{ijk}}"
                        style={longMathStyle}
                      />
                    </div>
                  </div>
                  <div className="rounded-xl bg-gray-100/80 p-4 space-y-3">
                    <ul className="list-disc list-inside space-y-1 ml-4 [&>li]:marker:mr-[10px]">
                      <li><InlineMath math="EV" />：期待値</li>
                    </ul>
                  </div>
                </div>
              </section>
            </div>
          </CardContent>
        </Card >

        {/* 「お気づきでしょうか」カード */}
        <Card className="mb-10 shadow-2xl border-0 rounded-xl overflow-hidden">
          <CardHeader className="bg-blue-500 py-4">
            <CardTitle className="flex items-center space-x-3 text-xl md:text-2xl text-white">
              <Info className="h-6 w-6 md:h-8 md:w-8 text-white" />
              <span>お気づきでしょうか</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-5 md:p-8 bg-white">
            <div className="space-y-6">
              <section className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-800">期待値は常に0.75になります</h3>
                <p>
                  このツールで計算される期待値は、常に0.75（75%）になります。これは偶然ではなく、理論的な必然です。
                  以下で、なぜそうなるのかを詳しく説明します。
                </p>

                <div className="rounded-xl bg-blue-100/50 p-4 md:p-6 space-y-4">
                  <h4 className="text-[16px] md:text-lg font-medium text-blue-900">期待値の計算過程を追ってみましょう</h4>

                  <div className="space-y-3">
                    <p>1. まず、期待値の定義を確認します：</p>
                    <div className="overflow-x-auto">
                      <div className="w-full">
                        <BlockMath
                          math="EV = \frac{R}{\sum S_{ijk}} = \frac{\sum (R_{ijk} \times P_{ijk\_\text{norm}})}{\sum S_{ijk}}"
                          style={mathStyle}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p>2. 期待リターンの式を代入します：</p>
                    <div className="overflow-x-auto">
                      <div className="w-full">
                        <BlockMath
                          math="EV = \frac{\sum (S_{ijk} \times O_{ijk} \times P_{ijk\_\text{norm}})}{\sum S_{ijk}}"
                          style={mathStyle}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p>3. オッズの式を代入します：</p>
                    <div className="overflow-x-auto">
                      <div className="w-full">
                        <BlockMath
                          math="EV = \frac{\sum (S_{ijk} \times \frac{0.75}{P_{ijk\_\text{norm}}} \times P_{ijk\_\text{norm}})}{\sum S_{ijk}}"
                          style={mathStyle}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p>4. 式を整理すると：</p>
                    <div className="overflow-x-auto">
                      <div className="w-full">
                        <BlockMath
                          math="EV = \frac{0.75 \times \sum S_{ijk}}{\sum S_{ijk}} = 0.75"
                          style={mathStyle}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-blue-100/50 p-4 md:p-6 space-y-4">
                  <h4 className="text-[16px] md:text-lg font-medium text-blue-900">この結果が意味すること</h4>
                  <div className="space-y-2">
                    <p>
                      期待値が0.75になるということは、長期的に見ると投資額の75%が返ってくることを意味します。
                      これは3連複の払戻率（控除率25%）そのものを表しています。この結果が意味すること、それは、どのような買い方（重みづけ）をしたとしても、オッズのみから予測するモデルでは期待値を上げることはできないということです。
                    </p>

                    <div className="mt-4 space-y-6">
                      <div className="mt-6">
                        <h4 className="text-[16px] md:text-lg font-medium text-blue-900">より精度の高い予測に向けて</h4>
                        <p className="mb-4">
                          これらの制約を克服し、より精度の高い予測を行うためには
                        </p>
                        <ul className="list-disc list-inside space-y-2 ml-2">
                          <li>過去のレースデータを活用した機械学習モデルの構築</li>
                          <li>血統、調教データ、馬場状態などの多変量解析</li>
                          <li>展開予想を考慮したシミュレーション</li>
                          <li>馬のコンディションや気性の分析</li>
                        </ul>
                        <p className="mt-4">
                          このように、実際の競馬では数値化できない要素が多く存在します。
                          本ツールは理論的な参考値を提供するものですが、
                          実践では機械学習による分析と、馬の心理面まで考慮した
                          人間の洞察力を組み合わせた総合的な判断が必要になります。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div >
    </div >
  )
}
