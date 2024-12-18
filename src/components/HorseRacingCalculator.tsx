"use client"

import { useState, ChangeEvent, useMemo } from "react"
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

export default function TrifectaReturnCalculator() {
  const [step, setStep] = useState(0)
  const [totalHorses, setTotalHorses] = useState<number>(18)

  const [stakes, setStakes] = useState<number[]>([])
  const [odds, setOdds] = useState<number[]>([])

  const [results, setResults] = useState<{
    totalStakes: number
    weightedReturn: number
    combinations: {
      horses: number[]
      stake: number
      expectedReturn: number
      approximateOdds: number
    }[]
  } | null>(null)

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
      const includedIndices = stakes.map((s, i) => ({ s, i }))
        .filter(obj => obj.s >= 100)
        .map(obj => obj.i)

      if (includedIndices.length < 3) {
        setResults(null)
        return
      }

      const includedStakes = includedIndices.map(i => stakes[i])
      const includedOdds = includedIndices.map(i => odds[i])

      // p_i_raw = 0.8 / O_i
      const p_raw = includedOdds.map(o => 0.8 / o)
      const sum_p_raw = p_raw.reduce((acc, v) => acc + v, 0)
      const p_norm = p_raw.map(v => v / sum_p_raw) // 正規化

      const combosStakes = combinations(includedStakes, 3)
      const combosOdds = combinations(includedOdds, 3)      // 単勝オッズ(オリジナル)で難易度計算用
      const combosPnorm = combinations(p_norm, 3)          // 正規化確率でP_ijk計算用

      let totalStakesAllCombos = 0
      let sumD = 0
      let sumWeightedReturn = 0

      const combinationResults: {
        horses: number[]
        stake: number
        expectedReturn: number
        approximateOdds: number
      }[] = []

      for (let c = 0; c < combosStakes.length; c++) {
        const comboStakes = combosStakes[c]
        const comboOddsSet = combosOdds[c]
        const comboP = combosPnorm[c]
        const horses = includedIndices.filter((_, idx) =>
          combinations(Array.from({ length: includedIndices.length }, (_, i) => i), 3)[c].includes(idx)
        )

        const P_ijk = comboP.reduce((prod, p) => prod * p, 1)
        const trifectaOdds = 0.75 / P_ijk
        const comboStakeSum = comboStakes.reduce((sum, val) => sum + val, 0)
        const comboReturn = comboStakeSum * trifectaOdds

        // D_comb = 1/(O1×O2×O3)
        const productOdds = comboOddsSet.reduce((prod, o) => prod * o, 1)
        const D_comb = 1 / productOdds

        totalStakesAllCombos += comboStakeSum
        sumD += D_comb
        sumWeightedReturn += comboReturn * D_comb

        // 各組み合わせの結果を保存
        combinationResults.push({
          horses: horses.map(i => i + 1), // 1-indexed
          stake: comboStakeSum,
          expectedReturn: comboReturn,
          approximateOdds: trifectaOdds
        })
      }

      const weightedReturn = sumD > 0 ? sumWeightedReturn / sumD : 0

      setResults({
        totalStakes: totalStakesAllCombos,
        weightedReturn: weightedReturn,
        combinations: combinationResults
      })
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

  // スワイプハンドラーを各馬ごとに作成
  const handlers = Array.from({ length: totalHorses }).map((_, index) => {
    return useSwipeable({
      onSwipedLeft: () => {
        handleStakeChange(index, Math.max(0, stakes[index] - 100))
      },
      onSwipedRight: () => {
        handleStakeChange(index, stakes[index] + 100)
      },
      onSwipedUp: () => {
        handleOddChange(index, odds[index] + 0.1)
      },
      onSwipedDown: () => {
        handleOddChange(index, Math.max(1, odds[index] - 0.1))
      },
      trackMouse: true
    })
  })

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
                <div className="rounded-xl bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm">
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
            <CardTitle className="text-2xl text-blue-900 flex items-center gap-4">
              <Calculator className="h-7 w-7 text-blue-600" />
              <span>{step === 0 ? "Step 1: 出走頭数入力" : "Step 2: 各馬の設定"}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 0 ? (
                <div className="space-y-6">
                  <Label className="text-lg font-medium text-blue-900 block mb-4">
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
                <div className="space-y-8">
                  <div className="bg-gradient-to-r from-blue-50 to-slate-50 rounded-xl p-6
                    border border-blue-100/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                          onClick={() => {
                            setStep(0)
                            setStakes([])
                            setOdds([])
                            setResults(null)
                          }}
                        >
                          <ChevronRight className="h-4 w-4 rotate-180 mr-2" />
                          戻る
                        </Button>
                        <p className="text-lg font-medium text-blue-900">
                          出走頭数: {totalHorses}頭
                        </p>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-5 w-5 text-blue-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>重みは100単位で設定してください</p>
                            <p>0円は除外扱いとなります</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>

                  {typeof totalHorses === "number" && totalHorses > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto">
                      {Array.from({ length: totalHorses }).map((_, i) => (
                        <div key={i}
                          className="bg-white rounded-lg shadow p-4 space-y-3"
                          {...handlers[i]}
                        >
                          <span className="text-xl font-bold text-blue-900">{i + 1}番</span>

                          <div className="space-y-4">
                            {/* 重みの入力 */}
                            <div className="space-y-2">
                              <Label className="text-sm text-gray-600">重み</Label>
                              <div className="space-y-2">
                                {/* スライダー */}
                                <div className="px-2">
                                  <Slider
                                    value={[Math.min(stakes[i], 1000)]}
                                    onValueChange={(value) => handleStakeChange(i, value[0])}
                                    min={0}
                                    max={1000}
                                    step={100}
                                    className="my-4"
                                  />
                                </div>
                                {/* 数値入力と微調整ボタン */}
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStakeChange(i, Math.max(0, stakes[i] - 100))}
                                    className="w-[60px] h-[45px]"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <Input
                                    type="number"
                                    min={0}
                                    step={100}
                                    value={stakes[i]}
                                    onChange={(e) => {
                                      const value = parseInt(e.target.value)
                                      if (!isNaN(value) && value >= 0) {
                                        handleStakeChange(i, value)
                                      }
                                    }}
                                    onWheel={(e) => {
                                      e.preventDefault()
                                      if (document.activeElement === e.currentTarget) {
                                        const delta = e.deltaY > 0 ? -100 : 100
                                        handleStakeChange(i, Math.max(0, stakes[i] + delta))
                                      }
                                    }}
                                    className="text-center w-[100px] h-[45px]"
                                  />
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleStakeChange(i, stakes[i] + 100)}
                                    className="w-[60px] h-[45px]"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* オッズの入力 */}
                            <div className="space-y-2">
                              <Label className="text-sm text-gray-600">単勝オッズ</Label>
                              <div className="space-y-2">
                                {/* スライダー */}
                                <div className="px-2">
                                  <Slider
                                    value={[Math.min(odds[i], 100)]}
                                    onValueChange={(value) => handleOddChange(i, value[0])}
                                    min={1.0}
                                    max={100.0}
                                    step={0.1}
                                    className="my-4"
                                  />
                                </div>
                                {/* 数値入力と微調整ボタン */}
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOddChange(i, Math.max(1, odds[i] - 0.1))}
                                    className="w-[60px] h-[45px]"
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <Input
                                    type="number"
                                    min={1.0}
                                    step={0.1}
                                    value={Number(odds[i]).toFixed(1)}
                                    onChange={(e) => {
                                      const value = parseFloat(e.target.value)
                                      if (!isNaN(value) && value >= 1.0) {
                                        handleOddChange(i, value)
                                      }
                                    }}
                                    onWheel={(e) => {
                                      e.preventDefault()
                                      if (document.activeElement === e.currentTarget) {
                                        const delta = e.deltaY > 0 ? -0.1 : 0.1
                                        handleOddChange(i, Math.max(1, odds[i] + delta))
                                      }
                                    }}
                                    className="text-center w-[100px] h-[45px]"
                                  />
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleOddChange(i, odds[i] + 0.1)}
                                    className="w-[60px] h-[45px]"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
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
          <Card className="mb-10 overflow-hidden border-2 border-blue-400 shadow-xl
            hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <CardHeader className="border-b border-blue-100 bg-gradient-to-r from-blue-100 via-blue-50 to-white py-8">
              <CardTitle className="text-2xl text-blue-800">
                <span>計算結果</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-8 bg-white">
              <div className="rounded-lg border p-4 space-y-2">
                <p>総掛け金: <span className="font-bold">{Math.round(results.totalStakes).toLocaleString()}</span> 円</p>
                <p>難易度加重期待リターン: <span className="font-bold">{Math.round(results.weightedReturn).toLocaleString()}</span> 円</p>
                <p>総組合せ数: <span className="font-bold">{results.combinations.length}</span> 通り</p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">買い目と期待リターン</h3>
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
                          <BlockMath math="P_{ijk} = p_{i\_\text{norm}} \times p_{j\_\text{norm}} \times p_{k\_\text{norm}}" />
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p><InlineMath math="P_{ijk}" />は、i, j, k番目の馬が3連複的中となる確率です。
                          各馬の正規化された勝率を掛け合わせることで、その組み合わせの理論的な的中確率を求めます。</p>
                      </div>
                    </div>
                  </li>

                  <li>
                    <div className="space-y-2">
                      <p className="font-medium">3連複オッズの理論値を計算：</p>
                      <div className="overflow-x-auto">
                        <div className="min-w-[200px]">
                          <BlockMath math="\text{3連複オッズ} = \frac{0.75}{P_{ijk}}" />
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
                      <p className="font-medium">期待リターンを計算：</p>
                      <div className="overflow-x-auto">
                        <div className="min-w-[300px]">
                          <BlockMath math="\text{期待リターン} = \text{掛け金合計} \times \left(\frac{0.75}{P_{ijk}}\right)" />
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
                        <BlockMath math="D_{\text{comb}} = \frac{1}{O_1 \times O_2 \times O_3}" />
                      </div>
                    </div>
                    <div className="space-y-2"></div>
                    <p className="font-medium">ここで：</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li><InlineMath math="D_{\text{comb}}" />：難易度係数（当たりやすさの指標）</li>
                      <li><InlineMath math="O_1, O_2, O_3" />：組み合わせに含まれる3頭の単勝オッズ</li>
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
                <h3 className="text-xl font-semibold text-blue-800">4. まとめ</h3>
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
