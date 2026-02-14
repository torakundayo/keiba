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

const longMathStyle = {
  fontSize: '1em',
  '@media (max-width: 768px)': {
    fontSize: '0.75em',
  },
}

export function InsightCard() {
  return (
    <Card className="mb-10 shadow-2xl border-0 rounded-xl overflow-hidden">
      <CardHeader className="bg-blue-500 py-4">
        <CardTitle className="flex items-center space-x-3 text-xl md:text-2xl text-white">
          <Info className="h-6 w-6 md:h-8 md:w-8 text-white" />
          <span>考察</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-5 md:p-8 bg-white">
        <div className="space-y-6">
          {/* 旧モデルの問題 */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-blue-800">なぜ単純なモデルでは期待値が0.75に固定されるのか</h3>
            <p>
              もし確率とオッズを同じモデル（単純積）から導出すると、期待値は必ず0.75に固定されます。
              これは数学的なトートロジー（同語反復）です。
            </p>

            <div className="rounded-xl bg-blue-100/50 p-4 md:p-6 space-y-4">
              <h4 className="text-[16px] md:text-lg font-medium text-blue-900">単一モデルの場合の計算過程</h4>

              <div className="space-y-3">
                <p>オッズと確率を同じ <InlineMath math="P^{\text{naive}}" /> から導出すると：</p>
                <div className="overflow-x-auto">
                  <div className="w-full">
                    <BlockMath
                      math="EV = \frac{\sum (S_{ijk} \times \frac{0.75}{P^{\text{naive}}_{ijk}} \times P^{\text{naive}}_{ijk})}{\sum S_{ijk}} = \frac{0.75 \times \sum S_{ijk}}{\sum S_{ijk}} = 0.75"
                      style={longMathStyle}
                    />
                  </div>
                </div>
                <p>
                  分子と分母の <InlineMath math="P^{\text{naive}}_{ijk}" /> が完全に相殺されるため、
                  どのような重み配分をしても期待値は変わりません。
                  オッズを生成した情報と同じ情報で確率を評価しているので、新しい知見が入り込む余地がないのです。
                </p>
              </div>
            </div>
          </section>

          {/* 2モデルアプローチの解説 */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-blue-800">2モデルアプローチによる解決</h3>
            <p>
              このツールでは、オッズの推定と確率の推定に異なるモデルを使うことで、この問題を解決しています。
            </p>

            <div className="rounded-xl bg-blue-100/50 p-4 md:p-6 space-y-4">
              <h4 className="text-[16px] md:text-lg font-medium text-blue-900">市場モデル（オッズ推定用）：単純積</h4>
              <div className="overflow-x-auto">
                <div className="w-full">
                  <BlockMath
                    math="P^{\text{naive}}_{ijk} \propto p_i \times p_j \times p_k"
                    style={mathStyle}
                  />
                </div>
              </div>
              <p>
                各馬の勝率を独立と仮定し、単純に掛け合わせるモデルです。
                市場がこの近似レベルでオッズを形成していると仮定します。
              </p>
            </div>

            <div className="rounded-xl bg-blue-100/50 p-4 md:p-6 space-y-4">
              <h4 className="text-[16px] md:text-lg font-medium text-blue-900">Harvilleモデル（確率推定用）：条件付き確率</h4>
              <div className="overflow-x-auto">
                <div className="w-full">
                  <BlockMath
                    math="P^{\text{H}}_{ijk} = \sum_{\pi \in S_3} p_{\pi_1} \times \frac{p_{\pi_2}}{1-p_{\pi_1}} \times \frac{p_{\pi_3}}{1-p_{\pi_1}-p_{\pi_2}}"
                    style={longMathStyle}
                  />
                </div>
              </div>
              <p>
                1着が決まると、その馬がプールから消えて残りの馬で2着争いが起きる
                ——この「脱落」の過程を条件付き確率で正確に表現するモデルです。
                単純積では捉えられないレース構造を反映できます。
              </p>
            </div>

            <div className="rounded-xl bg-blue-100/50 p-4 md:p-6 space-y-4">
              <h4 className="text-[16px] md:text-lg font-medium text-blue-900">2つのモデルのズレがバリューを生む</h4>
              <div className="overflow-x-auto">
                <div className="w-full">
                  <BlockMath
                    math="EV = 0.75 \times \frac{\sum (S_{ijk} \times \hat{P}^{\text{H}}_{ijk} \;/\; \hat{P}^{\text{naive}}_{ijk})}{\sum S_{ijk}}"
                    style={longMathStyle}
                  />
                </div>
              </div>
              <p>
                <InlineMath math="\hat{P}^{\text{H}}_{ijk} \neq \hat{P}^{\text{naive}}_{ijk}" /> なので、
                確率の変数が相殺されず、期待値が0.75から変動します。
              </p>
            </div>
          </section>

          {/* どのような組み合わせにズレが出るか */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-blue-800">どのような組み合わせでズレが大きくなるか</h3>

            <div className="rounded-xl bg-blue-100/50 p-4 md:p-6 space-y-4">
              <p>Harvilleモデルと単純積モデルの差が出やすいケース：</p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-[16px] md:text-lg font-medium text-green-700">Harville &gt; 単純積（バリューベット候補）</h4>
                  <p>
                    <strong>大本命 + 中穴 + 大穴</strong> のような組み合わせ。
                    大本命が1着で抜けると、中穴・大穴の2着3着確率が条件付きで大幅に上がります。
                    単純積モデルはこの効果を過小評価するため、市場オッズが実際より高くなる（割安になる）傾向があります。
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[16px] md:text-lg font-medium text-red-700">Harville &lt; 単純積（割高な買い目）</h4>
                  <p>
                    <strong>本命 + 本命 + 本命</strong> のような組み合わせ。
                    実力が拮抗した馬の組み合わせでは、1頭が抜けても残りの競争が激しいままです。
                    単純積モデルはこの組み合わせの確率を過大評価する傾向があります。
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 限界と注意点 */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-blue-800">このモデルの限界</h3>
            <div className="rounded-xl bg-gray-100/80 p-4 md:p-6 space-y-3">
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  <strong>市場モデルの仮定</strong>：実際の3連複市場が単純積モデルで価格形成されているという仮定に基づいています。
                  実際の市場はより複雑な要因で動くため、この仮定は近似です。
                </li>
                <li>
                  <strong>Harvilleモデルの限界</strong>：Harvilleモデル自体も「勝率の高い馬から順に脱落する」という仮定に基づいており、
                  実際のレース展開（逃げ・差し・追い込みなどの脚質）は考慮されていません。
                </li>
                <li>
                  <strong>データソース</strong>：両モデルとも同じ単勝オッズから出発しています。
                  単勝オッズ自体の精度がモデル全体の精度の上限となります。
                </li>
              </ul>
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  )
}
