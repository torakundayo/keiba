"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Info } from 'lucide-react'
import dynamic from 'next/dynamic'

const BlockMath = dynamic(() => import('react-katex').then(mod => mod.BlockMath), {
  ssr: false,
})
const InlineMath = dynamic(() => import('react-katex').then(mod => mod.InlineMath), {
  ssr: false,
})
import 'katex/dist/katex.min.css'

const mathStyle = {
  fontSize: '1em',
  '@media (max-width: 768px)': {
    fontSize: '0.85em',
  },
}

export function InsightCard() {
  return (
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
  )
}
