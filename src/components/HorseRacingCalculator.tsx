"use client"

import { useState, ChangeEvent, useMemo, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Calculator, MessageCircleQuestion, ChevronRight, Info, Plus, Minus, Loader2 } from 'lucide-react'
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
  onStakeChange,
  onOddChange
}: {
  index: number
  stake: number
  odd: number
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
    <div className="bg-white rounded-xl shadow p-4 space-y-3">
      <span className="text-xl font-bold text-blue-900">{index + 1}番</span>

      <div className="space-y-4">
        {/* 重みの入力 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-sm text-gray-600 min-w-[50px]">重み</Label>
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
          <div className="flex items-center gap-2 justify-end ml-[50px]">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                const newValue = Math.max(0, stake - 100)
                onStakeChange(newValue)
              }}
              className="w-[70px] h-[37px]"
            >
              <Minus className="h-4 w-4" />
            </Button>
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
              className="text-center w-[80px] h-[37px]"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                const newValue = stake + 100
                onStakeChange(newValue)
              }}
              className="w-[70px] h-[37px]"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* オッズの入力 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-sm text-gray-600 min-w-[50px]">オッズ</Label>
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
          <div className="flex items-center gap-2 justify-end ml-[50px]">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onOddChange(Math.max(1, odd - 0.1))}
              className="w-[70px] h-[37px]"
            >
              <Minus className="h-4 w-4" />
            </Button>
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
              className="text-center w-[80px] h-[37px]"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onOddChange(odd + 0.1)}
              className="w-[70px] h-[37px]"
            >
              <Plus className="h-4 w-4" />
            </Button>
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
  expectedReturn: number
  approximateOdds: number
  probability: number
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

export default function TrifectaReturnCalculator() {
  const [step, setStep] = useState(0)
  const [stakes, setStakes] = useState<number[]>([])
  const [odds, setOdds] = useState<number[]>([])
  const [isClient, setIsClient] = useState(false)
  const [results, setResults] = useState<{
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
  } | null>(null)
  const resultsRef = useRef<HTMLDivElement>(null);
  const [displayMode, setDisplayMode] = useState<'card' | 'table'>('card');
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'horses',
    direction: 'asc'
  });
  const [loadingRaceId, setLoadingRaceId] = useState<string | null>(null)

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
          ? aStr.localeCompare(bStr)  // 昇順
          : bStr.localeCompare(aStr); // 降順
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
    setStakes(Array(18).fill(0))
    setOdds(Array(18).fill(1.0))
    setIsClient(true)
  }, [])

  // レース情報の取得
  const { data: raceData } = useQuery<RaceResponse>({
    queryKey: ['recentGradeRace'],
    queryFn: async () => {
      const response = await axios.get('/api/recent-grade-race')
      return response.data
    }
  })

  // レースの予想オッズを取得する関数を修正
  const importRaceOdds = async (raceUrl: string) => {
    try {
      setLoadingRaceId(raceUrl) // ローディング開始
      const encodedUrl = encodeURIComponent(raceUrl)
      const response = await axios.get<HorseOdds[]>(`/api/race-odds/${encodedUrl}`)
      const horseOdds = response.data

      // 既存の馬番とオッズをリセット
      const newOdds = Array(18).fill(1.0)

      // 取得したオッズを設定
      horseOdds.forEach((horse, index) => {
        if (index < 18) {
          newOdds[index] = horse.odds
        }
      })

      setOdds(newOdds)
      setStakes(Array(18).fill(0)) // 重みはリセット
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    calculateResults()
  }

  const calculateResults = () => {
    // 選択された馬のインデックスを抽出（重みが100以上の馬）
    const includedIndices = stakes.map((s, i) => ({ s, i }))
      .filter(obj => obj.s >= 100)
      .map(obj => obj.i)

    // 3頭未満の場合は計算不可
    if (includedIndices.length < 3) {
      setResults(null)
      return
    }

    // 選択された馬の掛け金とオッズを抽出
    const includedStakes = includedIndices.map(i => stakes[i])
    const includedOdds = includedIndices.map(i => odds[i])

    // 生の確率を計算 (オッズから逆算、0.8は単勝市場の払戻率)
    const p_raw = includedOdds.map(o => 0.8 / o)
    // 生の確率の合計
    const sum_p_raw = p_raw.reduce((acc, v) => acc + v, 0)
    // 確率を正規化（合計が1になるように）
    const p_norm = p_raw.map(v => v / sum_p_raw)

    // 3頭組み合わせの配列を生成
    const combosStakes = combinations(includedStakes, 3)  // 掛け金の組み合わせ
    const combosOdds = combinations(includedOdds, 3)      // オッズの組み合わせ（難易度計算用）
    const combosPnorm = combinations(p_norm, 3)           // 正規化確率の組み合わせ（確率計算用）

    // 集計用の変数を初期化
    let totalStakesAllCombos = 0  // 総掛け金
    let sumD = 0                  // 難易度の合計
    let sumWeightedReturn = 0     // 難易度加重期待リターンの合計

    // 各組み合わせの結果を格納する配列
    const combinationResults: CombinationResult[] = []

    // 各組み合わせについて計算
    for (let c = 0; c < combosStakes.length; c++) {
      const comboStakes = combosStakes[c]  // この組み合わせの掛け金
      const comboOddsSet = combosOdds[c]   // この組み合わせのオッズ
      const comboP = combosPnorm[c]        // この組み合わせの正規化確率

      // 馬番を1から始まる番号に変換
      const horses = includedIndices.filter((_, idx) =>
        combinations(Array.from({ length: includedIndices.length }, (_, i) => i), 3)[c].includes(idx)
      )

      // この組み合わせの総掛け金を計算
      const comboStakeSum = comboStakes.reduce((sum, val) => sum + val, 0)

      // 3頭の組み合わせの確率を計算（正規化された確率の積）
      const P_ijk_raw = comboP.reduce((prod, p) => prod * p, 1)
      combinationResults.push({
        horses: horses.map(i => i + 1),
        stake: comboStakeSum,
        expectedReturn: 0, // 後で計算
        approximateOdds: 0, // 後で計算
        probability: P_ijk_raw  // 一時的に生の確率を保存
      })
    }

    // 確率の合計を計算
    const totalProb = combinationResults.reduce((sum, c) => sum + c.probability, 0)

    // 確率を正規化して期待リターンとオッズを計算
    for (const combo of combinationResults) {
      // 確率を正規化
      const P_ijk = combo.probability / totalProb

      // 3連複オッズを確率から計算（0.75は3連複市場の払戻率）
      const trifectaOdds = 0.75 / P_ijk

      // 期待リターンを計算
      const comboReturn = combo.stake * trifectaOdds

      // 結果を更新
      combo.probability = P_ijk  // 正規化された確率で上書き
      combo.approximateOdds = trifectaOdds
      combo.expectedReturn = comboReturn
    }

    // 難易度の計算と集計
    for (const combo of combinationResults) {
      // 難易度を計算（オッズの積の逆数）
      const productOdds = combosOdds[combinationResults.indexOf(combo)].reduce((prod, o) => prod * o, 1)
      const D_comb = 1 / productOdds

      // 集計値を更新
      totalStakesAllCombos += combo.stake
      sumD += D_comb
      sumWeightedReturn += combo.expectedReturn * D_comb
    }

    const weightedReturn = sumD > 0 ? sumWeightedReturn / sumD : 0

    // 最小・最大期待リターンを計算
    const minReturn = Math.min(...combinationResults.map(c => c.expectedReturn));
    const maxReturn = Math.max(...combinationResults.map(c => c.expectedReturn));
    const minReturnCombo = combinationResults.find(c => c.expectedReturn === minReturn);
    const maxReturnCombo = combinationResults.find(c => c.expectedReturn === maxReturn);

    setResults({
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
    });

    // 計算結果までスクロール
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
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
        <Card className="mb-10 shadow-xl border border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-50 via-white to-blue-50 py-8">
            <CardTitle className="flex items-center space-x-3 text-xl md:text-2xl text-blue-800">
              <TbHorse className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
              <span className="relative group">
                どういうツール？
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-300 transform
                  scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></div>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 md:p-8">
            <div className="space-y-4">
              <p>
                このツールは、<strong>3連複馬券の買い目をシミュレーションする</strong>ために作られました。
                各馬の単勝オッズと掛け金から、理論的な期待リターンを計算し、
                どの組み合わせに投資価値があるかを判断する指標を提供します。
              </p>
              <div className="rounded-xl bg-blue-50/50 p-4 md:p-6 space-y-3">
                <h4 className="text-[16px] md:text-lg font-medium text-blue-900">主なポイント</h4>
                <div className="space-y-2">
                  <p>・単勝オッズから3連複オッズを予測</p>
                  <p>・重みを考慮した期待リターンの計算</p>
                  <p>・複数の組み合わせを一括で評価可能</p>
                </div>
              </div>
              <div className="rounded-xl bg-blue-50/50 p-4 md:p-6 space-y-3">
                <h4 className="text-[16px] md:text-lg font-medium text-blue-900">使い方</h4>
                <ol className="list-decimal list-inside space-y-2 ml-2">
                  <li>各馬の重みとオッズを入力</li>
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

        <Card className="mb-10 shadow-[0_0_15px_rgba(0,0,0,0.1)] border border-blue-100 hover:shadow-3xl transition-all duration-500
          border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50/50 via-white to-blue-50/50
            py-8 border-b border-blue-100/50">
            <CardTitle className="text-xl md:text-2xl text-blue-900 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Calculator className="h-5 w-5 md:h-7 md:w-7 text-blue-600" />
                <span>シミュレーションする</span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            {raceData?.races && (
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-700 mb-3">
                  直近の重賞レース
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  以下のレースのオッズをインポートできます。インポートしたオッズは手動で調整可能です。
                </p>
                <div className="flex flex-col gap-3">
                  {raceData.races.map((race) => (
                    <button
                      key={race.date}
                      type="button"
                      onClick={() => importRaceOdds(race.url)}
                      disabled={loadingRaceId === race.url}
                      className="group relative w-full bg-white hover:bg-blue-50
                        border border-blue-200 rounded-xl overflow-hidden transition-all duration-200
                        shadow-sm hover:shadow-md disabled:cursor-not-allowed"
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-blue-600 mb-1">
                              {race.date}
                            </p>
                            <p className="text-lg font-medium text-gray-800">
                              {race.name}
                            </p>
                          </div>
                          <div className="flex items-center text-blue-500 group-hover:text-blue-600">
                            {loadingRaceId === race.url ? (
                              <div className="flex items-center text-blue-600">
                                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                <span className="text-sm">インポート中...</span>
                              </div>
                            ) : (
                              <>
                                <span className="text-sm mr-2">オッズをインポート</span>
                                <ChevronRight className="h-5 w-5" />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600
                        transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200" />
                    </button>
                  ))}
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-6">
                {/* 馬の入力フォーム */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
                  {Array.from({ length: 18 }).map((_, i) => (
                    <HorseInput
                      key={i}
                      index={i}
                      stake={stakes[i]}
                      odd={odds[i]}
                      onStakeChange={(value) => handleStakeChange(i, value)}
                      onOddChange={(value) => handleOddChange(i, value)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-8">
                <Button
                  type="button"
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200
                    shadow-md hover:shadow-xl px-6 py-2 rounded-xl"
                  onClick={() => {
                    setStakes(Array(18).fill(0))
                    setOdds(Array(18).fill(1.0))
                    setResults(null)
                  }}
                >
                  リセット
                </Button>
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
          <Card className="mb-10 overflow-hidden border-2 border-blue-400 shadow-xl"
            ref={resultsRef}
          >
            <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-100 via-blue-50 to-white py-8">
              <CardTitle className="text-2xl text-blue-800">
                <span>計算結果</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-5 md:p-8 bg-white">
              <div className="rounded-xl border p-6 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <p>
                      総組合せ数: <span className="font-bold">{results.combinations.length}</span> 通り
                    </p>
                    <p>総掛け金: <span className="font-bold">{Math.round(results.totalStakes).toLocaleString()}</span> 円</p>
                    <p>難易度加重期待リターン: <span className="font-bold">{Math.round(results.weightedReturn).toLocaleString()}</span> 円</p>
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
                    onClick={() => setDisplayMode(prev => prev === 'card' ? 'table' : 'card')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {displayMode === 'card' ? 'テーブル表示' : 'カード表示'}
                  </Button>
                </div>

                {displayMode === 'card' ? (
                  <div className="grid gap-4 md:grid-cols-3">
                    {results.combinations.map((combo, idx) => (
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
                  </div>
                ) : (
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
                                          少ない組み合わせ数では各組み合わせの相対的な確率がモデルの仮定（独立性や単純な積の確率）に強く依存するため、出走頭数が少ないほど確率の歪みが大きくなる傾向があります。
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
                                text-left
                                p-1 md:p-3
                                text-xs md:text-base
                                font-medium
                                text-blue-800
                                cursor-pointer
                                hover:bg-blue-100/50
                                transition-colors
                              `}
                            >
                              <div className="flex items-center gap-1">
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
                        {sortedCombinations.map((combo, index) => (
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
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-xl border border-blue-100">
          <CardHeader className="bg-gradient-to-r from-gray-50 via-white to-gray-50 py-8 border-b border-blue-100">
            <CardTitle className="flex items-center space-x-3 text-xl md:text-2xl text-blue-800">
              <MessageCircleQuestion className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
              <span>なぜこの結果になるの？</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-5 md:p-8 bg-white">
            <div className="space-y-6">

              {/* 説明部分を更新 */}
              <section className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-800">仕組みの概要</h3>
                <div className="space-y-4">
                  <div className="rounded-xl bg-blue-50/50 p-4 md:p-6 space-y-4">
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
                          <li>予想される払戻金（オッズ）</li>
                          <li>掛け金に対する期待リターン</li>
                        </ul>
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-[16px] md:text-lg font-medium text-blue-900">3. 買い目のシミュレーション</h4>
                      <p>
                        計算結果を「期待リターン」と「当たりやすさ」の両面から評価し、
                        買い目全体で見た期待リターンを提示します。
                        重みの設定により、特定の馬を重視した計算が可能です。
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    ※この仕組みは理論的な予測であり、実際のレース結果は様々な要因で変動する可能性があります。
                  </p>
                </div>
              </section>

              {/* 期待リターンの計算方法 */}
              <section className="space-y-4 !mt-10">
                <h3 className="text-xl font-semibold text-blue-800">期待リターンの計算方法</h3>
                <p>具体的には、以下の理論的な仮定と近似に基づいて計算を行っています。</p>

                <div className="space-y-6">
                  {/* 3着以内の確率の近似 */}
                  <div className="rounded-xl bg-blue-50/50 p-4 md:p-6 space-y-3">
                    <h4 className="text-[16px] md:text-lg font-medium text-blue-900">3着以内に入る確率の近似</h4>
                    <p>単勝オッズは「1着になる確率」を反映していますが、3連複では「3着以内に入る確率」が必要です。
                      そこで、以下のように考えます。</p>
                    <p>まず、各馬の3着以内確率は単勝確率に比例すると仮定します。
                      これを数式で表すと、比例定数Cを用いて <InlineMath math="q_i = C \times p_i" /> となります。
                      このCは3着以内という性質から理論的に3倍以上となり、実際には3～5倍程度と想定されます。</p>
                    <div className="bg-white/80 p-4 rounded-xl">
                      <p className="text-sm text-gray-600">
                        この近似により、人気馬ほど3着以内に入りやすいという性質を表現しています。
                      </p>
                    </div>
                  </div>

                  {/* 3頭組の同時確率 */}
                  <div className="rounded-xl bg-blue-50/50 p-4 md:p-6 space-y-3">
                    <h4 className="text-[16px] md:text-lg font-medium text-blue-900">3頭組の同時確率の近似</h4>
                    <p>3頭が同時に3着以内に入る確率は、単純な独立事象ではありません。
                      しかし、計算を簡略化するために、次のような近似を行います。</p>
                    <p>まず、3頭の着順は考慮せず、3着以内に入る順不同の組み合わせとして扱います。
                      次に、各馬の3着以内確率を独立と仮定して積を取ります。
                      実際には馬同士の相関があるため、これは近似的な取り扱いとなります。</p>
                  </div>

                  {/* オッズの近似 */}
                  <div className="rounded-xl bg-blue-50/50 p-4 md:p-6 space-y-3">
                    <h4 className="text-[16px] md:text-lg font-medium text-blue-900">3連複オッズの近似</h4>
                    <p>理論的な3連複オッズは、確率の逆数に払戻率を掛けたものとして計算されます。
                      この計算では、払戻率として75%を採用し、予想オッズを0.75を3頭の組の確率で割って算出します。</p>
                    <p>ただし、実際の市場では様々な要因でオッズが理論値から歪むことがあります。</p>
                    <div className="bg-white/80 p-4 rounded-xl">
                      <p className="text-sm text-gray-600">
                        この近似は理論値であり、実際の市場オッズとは乖離が生じる可能性があります。
                        特に人気薄同士の組み合わせでは、理論値より実際のオッズが高くなる傾向があります。
                      </p>
                    </div>
                  </div>
                </div>

                {/* 既存の計算ステップの説明 */}
                <p className="mt-8">これらの近似を踏まえ、具体的な計算手順は以下の通りです。</p>
                <ol className="list-decimal space-y-8 [&>li]:ml-[1.5em] [&>li]:pl-[0.5em]">
                  <li className="font-medium">単勝オッズから各馬の理論的な勝率を推定</li>
                </ol>

                <div className="space-y-3">
                  <div className="overflow-x-auto">
                    <div className="min-w-[200px]">
                      <BlockMath math="p_i = \frac{0.8}{O_i}" />
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                    <p>ここで</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 [&>li]:marker:mr-[10px]">
                      <li><InlineMath math="p_i" />：i番目の馬の推定勝率</li>
                      <li><InlineMath math="O_i" />：i番目の馬の単勝オッズ</li>
                      <li>0.8は払戻率80%を表す（控除率20%を考慮）</li>
                    </ul>
                  </div>
                </div>

                <ol className="list-decimal space-y-8 [&>li]:ml-[1.5em] [&>li]:pl-[0.5em]" start={2}>
                  <li className="font-medium">推定勝率を正規化（全馬の勝率の合計を1にする）</li>
                </ol>

                <div className="space-y-3">
                  <div className="overflow-x-auto">
                    <div className="min-w-[200px]">
                      <BlockMath math="p_{i\_\text{norm}} = \frac{p_i}{\sum p_i}" />
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p>これにより、全馬の勝率の合計が100%になるように調整します。
                      <InlineMath math="p_{i\_\text{norm}}" />は正規化後の勝率です。</p>
                  </div>
                </div>

                <ol className="list-decimal space-y-8 [&>li]:ml-[1.5em] [&>li]:pl-[0.5em]" start={3}>
                  <li className="font-medium">3頭の組み合わせが的中する確率を計算</li>
                </ol>

                <div className="space-y-3">
                  <div className="overflow-x-auto">
                    <div className="min-w-[300px]">
                      <BlockMath math="P_{ijk}^{\text{初期}} = p_{i\_\text{norm}} \times p_{j\_\text{norm}} \times p_{k\_\text{norm}}" />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <p>各3頭組み合わせ（i, j, k）の初期的中確率<InlineMath math="P_{ijk}^{\text{初期}}" />を、正規化された単勝勝率の積として計算します。ここでは簡単のため、各馬の3着以内に入る確率が互いに独立であると仮定しています。</p>
                    </div>
                  </div>
                </div>

                <ol className="list-decimal space-y-8 [&>li]:ml-[1.5em] [&>li]:pl-[0.5em]" start={4}>
                  <li className="font-medium">確率の正規化</li>
                </ol>

                <div className="space-y-3">
                  <div className="overflow-x-auto">
                    <div className="min-w-[300px]">
                      <BlockMath math="S = \sum_{(i,j,k)} P_{ijk}^{\text{初期}}" />
                      <BlockMath math="P_{ijk} = \frac{P_{ijk}^{\text{初期}}}{S}" />
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p>これにより、全組み合わせの確率の合計が100%になるように調整します。</p>
                  </div>
                </div>

                <ol className="list-decimal space-y-8 [&>li]:ml-[1.5em] [&>li]:pl-[0.5em]" start={5}>
                  <li className="font-medium">3連複オッズの近似</li>
                </ol>

                <div className="space-y-3">
                  <div className="overflow-x-auto">
                    <div className="min-w-[300px]">
                      <BlockMath math="O_{ijk} = \frac{0.75}{P_{ijk}}" />
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                    <p>ここで0.75は3連複の払戻率（75%）を表します。</p>
                    <p>確率が低いほどオッズは高くなり、確率が高いほどオッズは低くなります。</p>
                  </div>
                </div>

                <ol className="list-decimal space-y-8 [&>li]:ml-[1.5em] [&>li]:pl-[0.5em]" start={6}>
                  <li className="font-medium">期待リターンの計算</li>
                </ol>

                <div className="space-y-3">
                  <div className="overflow-x-auto">
                    <div className="min-w-[300px]">
                      <BlockMath math="\text{期待リターン}_{ijk} = \text{掛け金}_{ijk} \times O_{ijk}" />
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p>各組み合わせの掛け金に理論オッズを掛けることで、その組み合わせで期待できる払戻金額を計算します。</p>
                  </div>
                </div>
              </section>

              {/* 難易度加重について */}
              <section className="space-y-4 !mt-10">
                <h3 className="text-xl font-semibold text-blue-800">難易度加重について</h3>
                <div className="space-y-4">
                  <p>
                    単純な期待リターンだけでなく、「当たりやすさ」も考慮して評価を行います。
                    これを「難易度加重」と呼んでいます。
                  </p>
                  <div className="rounded-xl bg-gray-50 p-4 space-y-3">
                    <p className="font-medium">難易度加重の計算</p>
                    <div className="overflow-x-auto">
                      <div className="min-w-[400px]">
                        <BlockMath math="\text{難易度加重期待リターン} = \frac{\sum (\text{期待リターン} \times D_{\text{comb}})}{\sum D_{\text{comb}}}" />
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <div className="min-w-[300px]">
                        <BlockMath math="D_{\text{comb}} = \frac{1}{O_i \times O_j \times O_k}" />
                      </div>
                    </div>
                    <div className="space-y-2"></div>
                    <p className="font-medium">ここで</p>
                    <ul className="list-disc list-inside space-y-1 ml-4 [&>li]:marker:mr-[10px]">
                      <li><InlineMath math="D_{\text{comb}}" />：難易度係数（当たりやすさの指標）</li>
                      <li><InlineMath math="O_i, O_j, O_k" />：組み合わせに含まれる3頭の単勝オッズ</li>
                    </ul>
                    <p className="mt-4">
                      オッズが低い（＝人気がある＝当たりやすい）組み合わせほど<InlineMath math="D_{\text{comb}}" />は大きくなり、
                      最終的な評価により大きく反映されます。これにより、現実的な組み合わせがより高く評価されます。
                    </p>
                  </div>
                </div>
              </section>

              {/* まとめ */}
              <section className="space-y-4 !mt-10">
                <h3 className="text-xl font-semibold text-blue-800">まとめ</h3>
                <div>
                  <p>
                    このツールは、<strong>当たりやすい組み合わせを重視して期待リターンを評価</strong>します。
                    「掛け金 × 予想オッズ」に加えて「当たりやすさ」の重み付けを行い、より直感的な結果が得られます。
                  </p>
                  <p className="text-sm text-gray-600">
                    理論モデルであるため実際の馬券市場と完全には一致しませんが、他の組み合わせと比較する際の参考として活用できます。
                  </p>
                </div>
              </section>

            </div>
          </CardContent>
        </Card >

      </div >
    </div >
  )
}
