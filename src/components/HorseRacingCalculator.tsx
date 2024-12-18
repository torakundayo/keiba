"use client"

import { useState, ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Calculator, RefreshCcw, ChevronRight, Info, X, Check} from 'lucide-react'
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
  const [totalHorses, setTotalHorses] = useState<number | "">("")

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
    if (step === 0 && totalHorses) {
      if (typeof totalHorses === "number") {
        const initialStakes = Array(totalHorses).fill(0)
        const initialOdds = Array(totalHorses).fill(1.0)
        setStakes(initialStakes)
        setOdds(initialOdds)
      }
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
        const trifectaOdds = 0.6 / P_ijk
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
    setTotalHorses(parseInt(e.target.value) || "")
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
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1
              bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
          </div>
        <Card className="mb-10 shadow-xl hover:shadow-2xl transition-all duration-300 border border-blue-100">
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
                    <li>各馬の重み（100円単位）とオッズを設定</li>
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
                      value={[totalHorses || 10]}
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
                      <p className="text-lg font-medium text-blue-900">
                        出走頭数: {totalHorses}頭
                      </p>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {Array.from({ length: totalHorses }).map((_, i) => (
                        <div key={i}
                          className="group relative p-6 rounded-xl bg-gradient-to-br from-white to-slate-50
                            border border-blue-100/50 hover:border-blue-200 transition-all duration-300
                            hover:shadow-lg transform hover:-translate-y-1">
                          <div className="absolute top-2 right-2 text-2xl font-bold text-blue-900/20">
                            {i + 1}
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-gray-600">重み（100単位）</Label>
                              <Input
                                type="number"
                                min={0}
                                step={100}
                                value={stakes[i] || 0}
                                onChange={(e) => handleStakeChange(i, parseInt(e.target.value) || 0)}
                                className="w-full shadow-sm group-hover:shadow transition-all duration-300"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-gray-600">単勝オッズ</Label>
                              <Input
                                type="number"
                                min={1.0}
                                step={0.1}
                                value={odds[i] || 1.0}
                                onChange={(e) => handleOddChange(i, parseFloat(e.target.value) || 1.0)}
                                className="w-full shadow-sm group-hover:shadow transition-all duration-300"
                              />
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
                      shadow-md hover:shadow-xl transform hover:-translate-y-1 px-6 py-2 rounded-lg"
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
                    shadow-md hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0
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
              <CardTitle className="text-2xl text-blue-800 flex items-center justify-between">
                <span>計算結果</span>
                <Button
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                  onClick={() => setResults(null)}
                >
                  結果をクリア
                </Button>
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
                加重平均期待リターンは、(0.6/P_ijk)で近似した3連複オッズを用い、
                オッズ積逆数で加重平均した結果です。
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border border-blue-100">
          <CardHeader className="bg-gradient-to-r from-gray-50 via-white to-gray-50 py-8 border-b border-blue-100">
            <CardTitle className="text-2xl text-blue-800">なぜこの結果になるのか？</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-8 bg-white">
            <div className="space-y-6">

              {/* 文系向けの説明 */}
              <section className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-800">簡単な説明</h3>
                <p>
                  このツールでは、<strong>掛け金と確率を使って「期待リターン」を計算</strong>しています。
                  例えば、当たりやすい組み合わせ（オッズが低い）は「重み」を大きくして評価します。
                </p>
                <div className="rounded-lg bg-blue-50 p-4 space-y-2">
                  <p>
                    - 1つの組み合わせの期待リターンは「掛け金 × 近似的な3連複オッズ」で求めます。<br />
                    - 当たりやすい組み合わせほど評価が高くなり、全体の平均に反映されます。
                  </p>
                  <p className="text-gray-600">
                    つまり「当たりやすい組み合わせは重要」「当たりにくい組み合わせは軽く扱う」という考え方です。
                  </p>
                </div>
              </section>

              {/* 理系向けの詳細説明 */}
              <section className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-800">期待リターンの計算方法</h3>
                <p>具体的には、以下の手順で計算しています。</p>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    <p>単勝オッズから確率の指標を作ります：</p>
                    <BlockMath math="p_i = \frac{0.8}{O_i}" />
                    <p>（払戻率80%が考慮されています）</p>
                  </li>
                  <li>
                    <p>全馬の確率を足し、その合計で割って正規化します：</p>
                    <BlockMath math="p_{i\_\text{norm}} = \frac{p_i}{\sum p_i}" />
                  </li>
                  <li>
                    <p>3頭の組み合わせの同時確率を求めます：</p>
                    <BlockMath math="P_{ijk} = p_{i\_\text{norm}} \times p_{j\_\text{norm}} \times p_{k\_\text{norm}}" />
                  </li>
                  <li>
                    <p>3連複オッズの近似を計算します：</p>
                    <BlockMath math="\text{3連複オッズ} = \frac{0.6}{P_{ijk}}" />
                  </li>
                  <li>
                    <p>期待リターンは、掛け金合計に3連複オッズを掛けます：</p>
                    <BlockMath math="\text{期待リターン} = \text{掛け金合計} \times \left(\frac{0.6}{P_{ijk}}\right)" />
                  </li>
                </ol>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-800">難易度加重とは何か？</h3>
                <p>
                  「当たりやすさ」を重視するために、オッズの積の逆数 <InlineMath math="D_{\text{comb}}" /> を使います。
                  オッズが低い（当たりやすい）組み合わせは重みが大きくなります。
                </p>
                <div className="rounded-lg bg-gray-50 p-4 space-y-2">
                  <p>難易度加重期待リターンは以下のように求めます：</p>
                  <BlockMath math="\text{難易度加重期待リターン} = \frac{\sum (\text{期待リターン} \times D_{\text{comb}})}{\sum D_{\text{comb}}}" />
                  <p>
                    <BlockMath math="D_{\text{comb}} = \frac{1}{O_1 \times O_2 \times O_3}" />
                    当たりやすい組み合わせほど <InlineMath math="D_{\text{comb}}" /> が大きくなり、評価が高まります。
                  </p>
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
        </Card>

      </div>
    </div>
  )
}
