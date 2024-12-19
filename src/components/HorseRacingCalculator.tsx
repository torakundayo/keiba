"use client"

import { useState, ChangeEvent, useMemo, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Calculator, RefreshCcw, ChevronRight, Info, X, Check, Plus, Minus } from 'lucide-react'
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
  const handlers = useSwipeable({
    onSwipedLeft: () => onStakeChange(Math.max(0, stake - 100)),
    onSwipedRight: () => onStakeChange(stake + 100),
    onSwipedUp: () => onOddChange(odd + 0.1),
    onSwipedDown: () => onOddChange(Math.max(1, odd - 0.1)),
    trackMouse: true
  })

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-3">
      <span className="text-xl font-bold text-blue-900">{index + 1}番</span>

      <div className="space-y-4">
        {/* 重みの入力 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="text-sm text-gray-600 min-w-[50px]">重み</Label>
            <div {...handlers} className="flex-1">
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
              onClick={() => onStakeChange(Math.max(0, stake - 100))}
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
                  onStakeChange(Math.max(0, stake + delta))
                }
              }}
              className="text-center w-[80px] h-[37px]"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onStakeChange(stake + 100)}
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
            <div {...handlers} className="flex-1">
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

export default function TrifectaReturnCalculator() {
  const [step, setStep] = useState(0)
  const [totalHorses, setTotalHorses] = useState<number>(0)
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
  const [sortConfig, setSortConfig] = useState<{
    key: 'horses' | 'stake' | 'approximateOdds' | 'expectedReturn' | 'probability';
    direction: 'asc' | 'desc';
  }>({
    key: 'horses',
    direction: 'asc'
  });

  // 計算結果の組み合わせをソートする処理
  // useMemoを使用してソート結果をメモ化し、不要な再計算を防ぐ
  const sortedCombinations = useMemo(() => {
    // 計算結果がない場合は空配列を返す
    if (!results?.combinations) return [];

    // 結果配列をコピーしてソート
    return [...results.combinations].sort((a, b) => {
      // 馬番組み合わせでソートする場合
      if (sortConfig.key === 'horses') {
        // 馬番をハイフン区切りの文字列に変換してソート
        const aStr = a.horses.join('-');
        const bStr = b.horses.join('-');
        return sortConfig.direction === 'asc'
          ? aStr.localeCompare(bStr)  // 昇順
          : bStr.localeCompare(aStr); // 降順
      }

      // 確率でソートする場合
      if (sortConfig.key === 'probability') {
        // P_ijkを計算（近似オッズの逆数）
        const aProb = 0.75 / a.approximateOdds;
        const bProb = 0.75 / b.approximateOdds;
        return sortConfig.direction === 'asc'
          ? aProb - bProb  // 昇順
          : bProb - aProb; // 降順
      }

      // その他の数値項目（掛け金、オッズ、期待リターン）でソート
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      return sortConfig.direction === 'asc'
        ? aValue - bValue  // 昇順
        : bValue - aValue; // 降順
    });
  }, [results?.combinations, sortConfig]);

  const handleSort = (key: typeof sortConfig.key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key ?
        (current.direction === 'asc' ? 'desc' : 'asc') : 'asc'
    }));
  };

  useEffect(() => {
    setTotalHorses(18)
    setStakes(Array(18).fill(0))
    setOdds(Array(18).fill(1.0))
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <div>Loading...</div>
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 0 && totalHorses >= 10 && totalHorses <= 18) {
      const initialStakes = Array(totalHorses).fill(0)
      const initialOdds = Array(totalHorses).fill(1.0)
      setStakes(initialStakes)
      setOdds(initialOdds)
      setStep(1)
    } else if (step === 1) {
      calculateResults()
    }
  }

  const calculateResults = () => {
    if (typeof totalHorses === "number") {
      // 選択された馬のインデックスを抽出
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
  }
  const handleTotalHorsesChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTotalHorses(parseInt(e.target.value) || 0)
    setStakes([])
    setOdds([])
    setResults(null)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 p-6 md:p-12">
      <div className="mx-auto max-w-5xl">
        <div className="relative mb-8 text-center">
          <h1 className="mb-12 text-center text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800
            bg-clip-text text-transparent hover:scale-105 transform transition-all duration-300">
            3連複期待リターン計算ツール
          </h1>
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-1
              bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
        </div>
        <Card className="mb-10 shadow-xl border border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-50 via-white to-blue-50 py-8">
            <CardTitle className="flex items-center space-x-3 text-2xl text-blue-800">
              <TbHorse className="h-8 w-8 text-blue-600" />
              <span className="relative group">
                このツールの目的
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-blue-300 transform
                  scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></div>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-800">使い方</h3>
                <div className="rounded-xl bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
                  <ol className="list-decimal list-inside space-y-3 text-gray-700">
                    <li>出走頭数を入力（10～18頭）</li>
                    <li>各馬の重み（100単位）とオッズを設定</li>
                    <li>計算ボタンで期待リターンを確認</li>
                  </ol>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-800">特徴</h3>
                <div className="rounded-xl bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm">
                  <ul className="list-disc list-inside space-y-3 text-gray-700">
                    <li>単勝オッズから3連複を予測</li>
                    <li>当たりやすさを考慮した期待値計算</li>
                    <li>複数の組み合わせを一括評価</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-10 shadow-2xl hover:shadow-3xl transition-all duration-500
          border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50/50 via-white to-blue-50/50
            py-8 border-b border-blue-100/50">
            <CardTitle className="text-2xl text-blue-900 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Calculator className="h-7 w-7 text-blue-600" />
                <span>{step === 0 ? "Step 1: 出走頭数入力" : "Step 2: 各馬の設定"}</span>
              </div>
              {step === 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="relative group px-6 py-2 text-blue-700 hover:text-blue-900
                    hover:bg-blue-100/50 transition-all duration-300"
                  onClick={() => {
                    setStep(0)
                    setStakes([])
                    setOdds([])
                    setResults(null)
                  }}
                >
                  <ChevronRight className="h-5 w-5 rotate-180 mr-2
                    group-hover:-translate-x-1 transition-transform duration-200" />
                  Step 1に戻る
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 0 ? (
                <div className="space-y-4">
                  <Label className="text-lg font-medium text-blue-900 block">
                    出走頭数: {totalHorses}頭
                  </Label>
                  <div className="max-w-lg mx-auto px-8">
                    <Slider
                      value={[totalHorses]}
                      onValueChange={(value) => setTotalHorses(value[0])}
                      min={10}
                      max={18}
                      step={1}
                      className="my-6"
                    />
                  </div>
                  <p className="text-sm text-blue-500 text-center">
                    ※10頭～18頭で設定してください
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* ナビゲーションヘッダー */}
                  <div className="flex items-center gap-4">
                  </div>

                  {/* レース情報と入力ガイド */}
                  <div className="!mt-0">
                    {/* レース情報 */}
                    <div className="text-sm text-blue-700 flex items-center gap-2">
                      <TbHorse className="h-4 w-4" />
                      <span>出走頭数: {totalHorses}頭</span>
                    </div>
                  </div>

                  {/* 馬の入力フォーム */}
                  {typeof totalHorses === "number" && totalHorses > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
                      {Array.from({ length: totalHorses }).map((_, i) => (
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
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-4 mt-8">
                {step === 1 && (
                  <Button
                    type="button"
                    className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200
                      shadow-md hover:shadow-xl px-6 py-2 rounded-lg"
                    onClick={() => {
                      if (typeof totalHorses === "number") {
                        setStakes(Array(totalHorses).fill(0))
                        setOdds(Array(totalHorses).fill(1.0))
                      }
                      setResults(null)
                    }}
                  >
                    リセット
                  </Button>
                )}
                <Button
                  type="submit"
                  className="min-w-[140px] bg-blue-600 hover:bg-blue-700 transition-all duration-200
                    shadow-md hover:shadow-xl active:translate-y-0
                    text-white font-medium px-6 py-2 rounded-lg"
                >
                  {step === 0 ? "次へ" : "計算する"}
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
            <CardContent className="space-y-8 p-8 bg-white">
              <div className="rounded-lg border p-6 space-y-4">
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
                      <div key={idx} className="p-4 border rounded-lg hover:bg-blue-50 transition-all">
                        <p className="font-medium">
                          {combo.horses.join('-')}
                        </p>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>掛け金: {combo.stake.toLocaleString()}円</p>
                          <p>近似オッズ: {combo.approximateOdds.toFixed(1)}</p>
                          <p>期待リターン: {Math.round(combo.expectedReturn).toLocaleString()}円</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead className="bg-blue-50">
                        <tr>
                          {[
                            { key: 'horses', label: '組合せ' },
                            { key: 'stake', label: '掛け金' },
                            { key: 'approximateOdds', label: '近似オッズ' },
                            { key: 'expectedReturn', label: '期待リターン' },
                            {
                              key: 'probability',
                              label: (
                                <div className="flex items-center gap-1">
                                  確率
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger>
                                        <Info className="h-4 w-4 text-blue-500" />
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-[300px] p-3 text-sm">
                                        少ない組み合わせ数では各組み合わせの相対的な確率がモデルの仮定（独立性や単純な積の確率）に強く依存するため、出走頭数が少ないほど確率の歪みが大きくなる傾向があります。
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              )
                            }
                          ].map(({ key, label }) => (
                            <th
                              key={key}
                              className="p-2 text-left border font-semibold text-blue-800 cursor-pointer
                                hover:bg-blue-100 transition-colors"
                              onClick={() => handleSort(key as typeof sortConfig.key)}
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
                        {sortedCombinations.map((combo, idx) => (
                          <tr key={idx} className="hover:bg-blue-50/50">
                            <td className="p-2 border font-medium">{combo.horses.join('-')}</td>
                            <td className="p-2 border text-right">{combo.stake.toLocaleString()}円</td>
                            <td className="p-2 border text-right">{combo.approximateOdds.toFixed(1)}</td>
                            <td className="p-2 border text-right">
                              {Math.round(combo.expectedReturn).toLocaleString()}円
                            </td>
                            <td className="p-2 border text-right">
                              {(combo.probability * 100).toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-blue-50/50 font-medium">
                          <td className="p-2 border">合計</td>
                          <td className="p-2 border text-right">
                            {sortedCombinations.reduce((sum, combo) => sum + combo.stake, 0).toLocaleString()}円
                          </td>
                          <td className="p-2 border"></td>
                          <td className="p-2 border"></td>
                          <td className="p-2 border text-right">
                            {(sortedCombinations.reduce((sum, combo) => sum + combo.probability, 0) * 100).toFixed(1)}%
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-600">
                加重平均期待リターンは、(0.75/P_ijk)で近似した3連複オッズを用い、
                オッズ積逆数で加重平均した結果です。
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-xl border border-blue-100">
          <CardHeader className="bg-gradient-to-r from-gray-50 via-white to-gray-50 py-8 border-b border-blue-100">
            <CardTitle className="text-2xl text-blue-800">なぜこの結果になるの？</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-8 bg-white">
            <div className="space-y-6">

              {/* 説明部分を更新 */}
              <section className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-800">簡単な説明</h3>
                <div className="space-y-4">
                  <p>
                    このツールでは、<strong>掛け金と確率を使って「期待リターン」を計算</strong>しています。
                    期待リターンとは、理論的に期待できる払戻金額のことです。
                  </p>
                  <div className="rounded-lg bg-blue-50 p-4 space-y-3">
                    <p className="font-medium">主なポイント：</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>単勝オッズから各馬の「勝つ確率」を推定</li>
                      <li>その確率を使って3連複の「当たる確率」を計算</li>
                      <li>確率が高い（＝当たりやすい）組み合わせは重視して評価</li>
                      <li>確率が低い（＝当たりにくい）組み合わせは軽く評価</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* 期待リターンの計算方法 */}
              <section className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-800">期待リターンの計算方法</h3>
                <p>具体的には、以下の理論的な仮定と近似に基づいて計算を行っています：</p>

                <div className="space-y-6">
                  {/* 3着以内の確率の近似 */}
                  <div className="rounded-lg bg-blue-50/50 p-6 space-y-3">
                    <h4 className="font-medium text-lg text-blue-900">3着以内に入る確率の近似</h4>
                    <p>単勝オッズは「1着になる確率」を反映していますが、3連複では「3着以内に入る確率」が必要です。
                      そこで、以下のように考えます。</p>
                    <p>まず、各馬の3着以内確率は単勝確率に比例すると仮定します。
                      これを数式で表すと、比例定数Cを用いて <InlineMath math="q_i = C \times p_i" /> となります。
                      このCは3着以内という性質から理論的に3倍以上となり、実際には3～5倍程度と想定されます。</p>
                    <div className="bg-white/80 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">
                        この近似により、人気馬ほど3着以内に入りやすいという性質を表現しています。
                      </p>
                    </div>
                  </div>

                  {/* 3頭組の同時確率 */}
                  <div className="rounded-lg bg-blue-50/50 p-6 space-y-3">
                    <h4 className="font-medium text-lg text-blue-900">3頭組の同時確率の近似</h4>
                    <p>3頭が同時に3着以内に入る確率は、単純な独立事象ではありません。
                      しかし、計算を簡略化するために、次のような近似を行います。</p>
                    <p>まず、3頭の着順は考慮せず、3着以内に入る順不同の組み合わせとして扱います。
                      次に、各馬の3着以内確率を独立と仮定して積を取ります。
                      実際には馬同士の相関があるため、これは近似的な取り扱いとなります。</p>
                  </div>

                  {/* オッズの近似 */}
                  <div className="rounded-lg bg-blue-50/50 p-6 space-y-3">
                    <h4 className="font-medium text-lg text-blue-900">3連複オッズの近似</h4>
                    <p>理論的な3連複オッズは、確率の逆数に払戻率を掛けたものとして計算されます。
                      この計算では、払戻率として75%を採用し、近似オッズを0.75を3頭の組の確率で割って算出します。</p>
                    <p>ただし、実際の市場では様々な要因でオッズが理論値から歪むことがあります。</p>
                    <div className="bg-white/80 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">
                        この近似は理論値であり、実際の市場オッズとは乖離が生じる可能性があります。
                        特に人気薄同士の組み合わせでは、理論値より実際のオッズが高くなる傾向があります。
                      </p>
                    </div>
                  </div>
                </div>

                {/* 既存の計算ステップの説明 */}
                <p className="font-medium mt-6">これらの近似を踏まえ、具体的な計算手順は以下の通りです：</p>
                <ol className="list-decimal pl-5 space-y-4">
                  <li>
                    <div className="space-y-2">
                      <p className="font-medium">単勝オッズから各馬の理論的な勝率を推定：</p>
                      <div className="overflow-x-auto">
                        <div className="min-w-[200px]">
                          <BlockMath math="p_i = \frac{0.8}{O_i}" />
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <p>ここで：</p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                          <li><InlineMath math="p_i" />：i番目の馬の推定勝率</li>
                          <li><InlineMath math="O_i" />：i番目の馬の単勝オッズ</li>
                          <li>0.8は払戻率80%を表す（控除率20%を考慮）</li>
                        </ul>
                      </div>
                    </div>
                  </li>

                  <li>
                    <div className="space-y-2">
                      <p className="font-medium">推定勝率を正規化（全馬の勝率の合計を1にする）：</p>
                      <div className="overflow-x-auto">
                        <div className="min-w-[200px]">
                          <BlockMath math="p_{i\_\text{norm}} = \frac{p_i}{\sum p_i}" />
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p>これにより、全馬の勝率の合計が100%になるように調整します。
                          <InlineMath math="p_{i\_\text{norm}}" />は正規化後の勝率です。</p>
                      </div>
                    </div>
                  </li>

                  <li>
                    <div className="space-y-2">
                      <p className="font-medium">3頭の組み合わせが的中する確率を計算：</p>
                      <div className="overflow-x-auto">
                        <div className="min-w-[300px]">
                          <BlockMath math="P_{ijk}^{\text{初期}} = p_{i\_\text{norm}} \times p_{j\_\text{norm}} \times p_{k\_\text{norm}}" />
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p>各3頭組み合わせ（i, j, k）の初期的中確率<InlineMath math="P_{ijk}^{\text{初期}}" />を、正規化された単勝勝率の積として計算します。ここでは簡単のため、各馬の3着以内に入る確率が互いに独立であると仮定しています。</p>
                        </div>
                      </div>
                    </div>
                  </li>

                  <li>
                    <div className="space-y-2">
                      <p className="font-medium">確率の正規化：</p>
                      <div className="overflow-x-auto">
                        <div className="min-w-[300px]">
                          <BlockMath math="S = \sum_{(i,j,k)} P_{ijk}^{\text{初期}}" />
                          <BlockMath math="P_{ijk} = \frac{P_{ijk}^{\text{初期}}}{S}" />
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p>これにより、全組み合わせの確率の合計が100%になるように調整します。</p>
                      </div>
                    </div>
                  </li>

                  <li>
                    <div className="space-y-2">
                      <p className="font-medium">3連複オッズの近似：</p>
                      <div className="overflow-x-auto">
                        <div className="min-w-[300px]">
                          <BlockMath math="O_{ijk} = \frac{0.75}{P_{ijk}}" />
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <p>ここで0.75は3連複の払戻率（75%）を表します。</p>
                        <p>確率が低いほどオッズは高くなり、確率が高いほどオッズは低くなります。</p>
                      </div>
                    </div>
                  </li>

                  <li>
                    <div className="space-y-2">
                      <p className="font-medium">期待リターンの計算：</p>
                      <div className="overflow-x-auto">
                        <div className="min-w-[300px]">
                          <BlockMath math="\text{期待リターン}_{ijk} = \text{掛け金}_{ijk} \times O_{ijk}" />
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p>各組み合わせの掛け金に理論オッズを掛けることで、その組み合わせで期待できる払戻金額を計算します。</p>
                      </div>
                    </div>
                  </li>
                </ol>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-800">難易度加重について</h3>
                <div className="space-y-4">
                  <p>
                    単純な期待リターンだけでなく、「当たりやすさ」も考慮して評価を行います。
                    これを「難易度加重」と呼んでいます。
                  </p>
                  <div className="rounded-lg bg-gray-50 p-4 space-y-3">
                    <p className="font-medium">難易度加重の計算：</p>
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
                    <p className="font-medium">ここで：</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
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
              <section className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-800">まとめ</h3>
                <div className="rounded-lg bg-gradient-to-r from-blue-50 to-gray-50 p-6 space-y-2">
                  <p>
                    このツールは、<strong>当たりやすい組み合わせを重視して期待リターンを評価</strong>します。
                    「掛け金 × 近似オッズ」に加えて「当たりやすさ」の重み付けを行い、より直感的な結果が得られます。
                  </p>
                  <p className="text-gray-600">
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
