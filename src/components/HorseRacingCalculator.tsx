"use client"

import { useState, ChangeEvent } from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { InfoIcon } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function HorseRacingCalculator() {
  const [step, setStep] = useState(0)
  const [totalHorses, setTotalHorses] = useState<number | "">("")
  const [excludedHorses, setExcludedHorses] = useState<number[]>([])
  const [confidence, setConfidence] = useState<number | "">("")
  const [results, setResults] = useState<{
    purchaseCount: number
    expectedValue: number
  } | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 0 && totalHorses) {
      setStep(1)
    } else if (step === 1 && confidence !== "") {
      calculateResults()
    }
  }

  const calculateResults = () => {
    if (typeof totalHorses === "number" && typeof confidence === "number") {
      const remainingHorses = totalHorses - excludedHorses.length
      if (remainingHorses >= 3) {
        const totalCombAll = combination(totalHorses, 3)
        const reducedCombos = combination(remainingHorses, 3)

        // 全体期待リターン（控除25%→期待値0.75倍）
        // 全馬券を買った場合、期待リターンは0.75 * totalCombAll
        const evSuccess = (0.75 * totalCombAll) / reducedCombos
        const p = confidence / 100
        const evTotal = p * evSuccess

        setResults({
          purchaseCount: reducedCombos,
          expectedValue: evTotal
        })
      } else {
        // 有効な組み合わせがない場合は結果をリセット
        setResults(null)
      }
    }
  }

  // 組み合わせ計算（再帰的定義はOKだが、性能面で問題ない程度の小規模なので可）
  const combination = (n: number, r: number): number => {
    if (r > n) return 0
    if (r === 0 || r === n) return 1
    // 簡易的計算方式：C(n,r)=C(n-1,r-1)+C(n-1,r)
    return combination(n - 1, r - 1) + combination(n - 1, r)
  }

  const handleTotalHorsesChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTotalHorses(parseInt(e.target.value) || "")
    setExcludedHorses([])
    setConfidence("")
    setResults(null)
  }

  const handleConfidenceChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfidence(parseInt(e.target.value) || "")
  }

  const handleCheckboxChange = (checked: boolean, horseNumber: number) => {
    if (checked) {
      setExcludedHorses(prev => [...prev, horseNumber])
    } else {
      setExcludedHorses(prev => prev.filter((h) => h !== horseNumber))
    }
    setResults(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 p-6 md:p-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-12 text-center text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800
          bg-clip-text text-transparent hover:scale-105 transform transition-all duration-300">
          3連複期待値計算ツール
        </h1>

        <div className="mb-12">
          <div className="flex justify-center space-x-8">
            <div className={`flex items-center transition-all duration-300 transform ${step >= 0 ? 'text-blue-600 scale-105' : 'text-gray-400'}`}>
              <div className={`rounded-full w-8 h-8 flex items-center justify-center border-2 shadow-md transition-all duration-300
                ${step >= 0 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                1
              </div>
              <span className="ml-2 font-medium">出走頭数入力</span>
            </div>
            <div className="border-t-2 border-gray-300 w-16 mt-4" />
            <div className={`flex items-center transition-all duration-300 transform ${step >= 1 ? 'text-blue-600 scale-105' : 'text-gray-400'}`}>
              <div className={`rounded-full w-8 h-8 flex items-center justify-center border-2 shadow-md transition-all duration-300
                ${step >= 1 ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}>
                2
              </div>
              <span className="ml-2 font-medium">除外馬選択</span>
            </div>
          </div>
        </div>

        <Card className="mb-10 shadow-xl hover:shadow-2xl transition-all duration-300 border border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-50 via-white to-blue-50 py-8">
            <CardTitle className="flex items-center space-x-3 text-2xl text-blue-800">
              <span>このツールの目的</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="hover:scale-110 transition-transform duration-200">
                    <InfoIcon className="h-5 w-5 text-blue-400" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-blue-900 text-white p-2 rounded-lg">
                    3連複の期待値を計算し、投資判断をサポートします
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-8 bg-white">
            <p className="text-gray-700 text-lg leading-relaxed">
              このツールは、競馬の3連複馬券を対象に、
              あなたが「3着以内に入らない」と思う馬を選び、
              その馬を除外することで期待値がどう変わるかを計算するためのツールです。
            </p>
            <div className="rounded-xl bg-gradient-to-r from-blue-50 to-white p-6 border border-blue-100">
              <h3 className="mb-4 font-semibold text-blue-800">使い方 (3つのステップ)</h3>
              <ol className="list-decimal space-y-3 pl-6 text-gray-700">
                <li>出走頭数を入力し、<span className="font-semibold">次へ</span>を押します。</li>
                <li>「3着以内に絶対入らない」と思う馬を選び、<span className="font-semibold">確信度 (%)</span>を入力します。</li>
                <li>計算結果として、期待値と購入点数が表示されます。</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-10 shadow-xl hover:shadow-2xl transition-all duration-300 border border-blue-100">
          <CardHeader className="bg-gradient-to-r from-blue-50 via-white to-blue-50 py-8 border-b border-blue-100">
            <CardTitle className="text-2xl text-blue-800">
              {step === 0 ? "Step 1: 出走頭数入力" : "Step 2: 除外馬選択"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 bg-white">
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 0 ? (
                <div className="space-y-4">
                  <Label htmlFor="total-horses" className="text-lg font-medium">
                    出走頭数（10～18）
                  </Label>
                  <div className="flex items-center space-x-4">
                    <Input
                      id="total-horses"
                      type="number"
                      min={10}
                      max={18}
                      value={totalHorses}
                      onChange={handleTotalHorsesChange}
                      className="max-w-[200px] text-lg shadow-sm hover:shadow transition-shadow duration-200"
                      required
                    />
                    <span className="text-sm text-gray-500 animate-pulse">※10頭から18頭まで入力可能</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-medium">出走頭数: {totalHorses}頭</p>
                    <Button
                      type="button"
                      onClick={() => {
                        setStep(0)
                        setTotalHorses("")
                        setExcludedHorses([])
                        setConfidence("")
                        setResults(null)
                      }}
                      className="text-sm"
                    >
                      頭数を変更
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <Label className="text-lg font-medium">除外する馬を選択:</Label>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
                      {typeof totalHorses === "number" && Array.from({ length: totalHorses }).map((_, i) => (
                        <div key={i} className="group">
                          <label className="flex items-center space-x-3 rounded-xl border border-gray-200 p-4
                            transition-all duration-200 hover:bg-blue-50 hover:border-blue-300
                            hover:shadow-lg cursor-pointer group-hover:scale-105 bg-white">
                            <Checkbox
                              id={`horse-${i + 1}`}
                              checked={excludedHorses.includes(i + 1)}
                              onCheckedChange={(checked) => handleCheckboxChange(checked as boolean, i + 1)}
                              className="transition-transform duration-200 hover:scale-110 data-[state=checked]:bg-blue-600"
                            />
                            <span className="text-base group-hover:text-blue-600 transition-colors duration-200 font-medium">
                              {i + 1}番
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="confidence" className="text-lg font-medium">確信度(%)</Label>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="hover:scale-110 transition-transform duration-200">
                            <InfoIcon className="h-4 w-4 text-blue-400" />
                          </TooltipTrigger>
                          <TooltipContent className="bg-blue-900 text-white p-2 rounded-lg">
                            確信度は「選んだ馬が3着以内に来ない確率」です
                            （例: 90%なら来ない自信が高い）
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Input
                      id="confidence"
                      type="number"
                      min={0}
                      max={100}
                      value={confidence}
                      onChange={handleConfidenceChange}
                      className="max-w-[200px] shadow-sm hover:shadow transition-shadow duration-200 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              )}
              <div className="flex justify-end space-x-4 mt-8">
                {step === 1 && (
                  <Button
                    type="button"
                    className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-200
                      shadow-md hover:shadow-xl transform hover:-translate-y-1 px-6 py-2 rounded-lg"
                    onClick={() => {
                      setExcludedHorses([])
                      setConfidence("")
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
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-blue-50 p-4 hover:bg-blue-100 transition-colors duration-200">
                  <p className="text-sm text-gray-600">除外馬数</p>
                  <p className="text-2xl font-bold">{excludedHorses.length}</p>
                </div>
                <div className="rounded-lg bg-blue-50 p-4 hover:bg-blue-100 transition-colors duration-200">
                  <p className="text-sm text-gray-600">確信度</p>
                  <p className="text-2xl font-bold">{confidence}%</p>
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <p className="mb-2">
                  購入する点数: <span className="font-bold">{results.purchaseCount}</span> 点
                </p>
                <p className="text-sm text-gray-600">
                  すべての馬券を100円ずつ購入すると総額{" "}
                  <span className="font-bold">{results.purchaseCount * 100}円</span> になります。
                </p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="mb-2">
                  期待値: <span className="font-bold">{results.expectedValue.toFixed(2)}</span>
                </p>
                <p className="text-sm text-gray-600">
                  例: 期待値が {results.expectedValue.toFixed(2)} の場合、100円の馬券は{" "}
                  <span className="font-bold">
                    {Math.round(results.expectedValue * 100)}円
                  </span>{" "}
                  のリターンになります。
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-xl hover:shadow-2xl transition-all duration-300 border border-blue-100">
          <CardHeader className="bg-gradient-to-r from-gray-50 via-white to-gray-50 py-8 border-b border-blue-100">
            <CardTitle className="text-2xl text-blue-800">なぜこの結果になるのか？</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-8 bg-white">
            <p>
              競馬の3連複では、<span className="font-semibold">出走頭数から3頭を選ぶ組み合わせ</span>
              が対象となります。
              例えば、18頭立てなら全体の組み合わせ数は <span className="font-semibold">816通り</span>{" "}
              です。
            </p>
            <p>
              ここで「3着以内に絶対入らない」と思う馬を除外すると、
              残りの馬の中から3頭を選ぶ組み合わせ数が減少し、期待値が変化します。
            </p>
            <div className="rounded-lg bg-gray-50 p-4">
              <p className="mb-2">期待値は次の計算式で求められます：</p>
              <p className="font-semibold">期待値 = 確信度 × (総リターン ÷ 購入点数)</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-600">
                <li>
                  総リターン: 競馬全体の控除率(約25%)を考慮したリターン（例: 0.75倍）
                </li>
                <li>
                  購入点数: 除外後の馬数から3頭を選ぶ組み合わせ数（C(馬数,3)）
                </li>
              </ul>
            </div>
            <p>
              このツールでは、あなたの直感や確信度に基づき、
              除外馬数と確信度が期待値に与える影響を計算し、表示します。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
