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
                  例: 期待値が {results.expectedValue.toFixed(2)} の場合、{results.purchaseCount * 100}円の馬券は{" "}
                  <span className="font-bold">
                    {Math.round(results.expectedValue * results.purchaseCount * 100)}円</span>{" "}
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
            <div className="space-y-6">
              <section className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-800">期待値とは何か？</h3>
                <p>
                  期待値とは、同じ条件のレースを理論的に何度も繰り返した場合の「平均的な回収率」を表した数値です。
                </p>
                <div className="rounded-lg bg-blue-50 p-4 space-y-2">
                  <p>「期待値が1.76」という場合、長い目で見て平均すると100円あたり176円のリターンが見込まれることを意味します。</p>
                  <p className="text-gray-600">
                    しかし、これは統計的な平均値であり、1回1回のレースで必ず100円が176円になることを保証するものではありません。
                  </p>
                  <p className="text-gray-600">
                    実際には、ほとんどのレースで損をし続け、まれに大きな配当が当たることで全体平均が1.76に近づく、というイメージです。
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-800">確信度とは？</h3>
                <p>
                  ここで用いている「確信度」とは、除外した馬が「3着以内に絶対来ない」と自分で判断した場合、その判断が正しい確率（％）を意味します。
                </p>
                <div className="rounded-lg bg-gray-50 p-4 space-y-2">
                  <p>例えば、確信度92%とした場合、その除外判断が約10回中9回当たると「自分では考えている」ことを表します。</p>
                  <p className="text-gray-600">
                    実際に92%の確率で当たるかどうかは、あなたの予想精度や情報量に大きく左右されます。
                  </p>
                  <p className="text-gray-600">
                    確信度が高ければ高いほど、想定上は期待値が上昇しますが、確信度の正しさを裏付ける客観的な根拠がない限り、その数値はあくまで自分の主観的な自信です。
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-800">購入する点数の意味</h3>
                <p>
                  「購入する点数」とは、残った馬（除外馬を外した後）の中から3頭を選ぶ組み合わせ数を意味しています。
                </p>
                <div className="rounded-lg bg-yellow-50 p-4 space-y-2">
                  <p>
                    例えば除外馬数4頭・確信度92%で220点となれば、220通りの3頭組み合わせをすべて購入すると考え、100円ずつ買えば22,000円を投資することになります。
                  </p>
                  <p className="text-gray-600">
                    この戦略は、1レースあたり大きな資金が必要になることもあり、当たれば1点が確実に的中する状況を作り出せる可能性がある一方で、除外判断が外れた場合は全額損になるリスクもあります。
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-800">なぜ期待値が変化するのか？</h3>
                <p>
                  期待値は、「全ての馬券を購入した場合の平均的リターン」を基準にしています。
                </p>
                <div className="rounded-lg bg-gray-50 p-4 space-y-2">
                  <p>
                    元々、JRAの控除率から考えると、何もしなければ全ての馬券の合計期待値は約0.75（100円あたり75円）程度に落ち着きます。
                  </p>
                  <p>
                    ところが、「3着以内に絶対来ない馬」を除外できると、残りの組み合わせ数が減り、そこに割り振られる期待的リターンが相対的に増えるため、期待値が1.0を超えたり、1.76など高い値になったりします。
                  </p>
                  <p className="text-gray-600">
                    しかし、この計算上の期待値1.76は「除外した馬が本当に92%の確率で3着以内に来ない」という条件が前提となっています。もし実際のレースで除外した馬が思ったより来てしまうと、期待値は下がります。
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-800">この期待値は「理想的な長期平均」</h3>
                <p>
                  期待値1.76などの数値は、確信度が正しく、無数に試行を繰り返した「理想的な長期平均」の数字です。
                </p>
                <div className="rounded-lg bg-blue-50 p-4 space-y-2">
                  <p>
                    現実には、試行回数が少ないうちは大きなぶれが生じます。何十回も外す可能性もあれば、早めに高配当を得て平均が一気に上昇することもあります。
                  </p>
                  <p>
                    長期的に見て、この確信度と除外戦略を維持できれば「平均的」にそれらの数値に近づいていく、という理論モデルの結果です。
                  </p>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xl font-semibold text-blue-800">まとめ</h3>
                <div className="rounded-lg bg-gradient-to-r from-blue-50 to-gray-50 p-6">
                  <ul className="space-y-2 list-disc pl-5">
                    <li><span className="font-semibold">期待値</span> = 長期的な平均回収率</li>
                    <li><span className="font-semibold">確信度</span> = 除外判断の正しさを自分で設定した確率（主観）</li>
                    <li><span className="font-semibold">購入点数</span> = 馬を絞った結果、残りから3頭を選ぶ組み合わせ数</li>
                  </ul>
                  <div className="mt-4 space-y-2 text-gray-600">
                    <p>このツールが示す結果は、あくまで理論的なモデルに基づくものです。</p>
                    <p>実際のレースでは、確信度が思うほど高くなかったり、大当たりが出る前に資金が尽きたりといった、様々な現実的要因があります。</p>
                    <p className="font-medium text-gray-800">
                      このツールの結果を参考情報として受け止め、実際の馬券購入では自己責任の下、十分な試行回数や資金管理、情報収集を行って判断することをおすすめします。
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
