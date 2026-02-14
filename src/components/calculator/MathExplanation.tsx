"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircleQuestion } from 'lucide-react'
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

export function MathExplanation() {
  return (
    <Card className="mb-10 shadow-2xl border-0 rounded-xl overflow-hidden">
      <CardHeader className="bg-blue-500 py-4">
        <CardTitle className="flex items-center space-x-3 text-xl md:text-2xl text-white">
          <MessageCircleQuestion className="h-6 w-6 md:h-8 md:w-8 text-white" />
          <span>計算方法の解説</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 p-5 md:p-8 bg-white">
        <div className="space-y-6">
          {/* 説明部分 */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-blue-800">文系でもわかる仕組みの概要</h3>
            <div className="space-y-4">
              <div className="rounded-xl bg-blue-100/50 p-4 md:p-6 space-y-4">
                <div className="space-y-2">
                  <h4 className="text-[16px] md:text-lg font-medium text-blue-900">1. 単勝オッズから各馬の勝率を推定</h4>
                  <p>
                    単勝オッズは、その馬が1着になる可能性を表しています。
                    つまり、オッズが低い馬ほど能力が高く評価されているということです。
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-[16px] md:text-lg font-medium text-blue-900">2. 2つのモデルで確率とオッズを別々に推定</h4>
                  <p>
                    このツールの核心は、「オッズの推定」と「的中確率の推定」に<strong>異なるモデル</strong>を使うことです。
                  </p>
                  <ul className="list-disc list-inside mt-2 ml-4 space-y-1">
                    <li><strong>市場モデル（単純積）</strong>：3連複オッズの推定に使用。市場がこの単純な近似でオッズを形成していると仮定します。</li>
                    <li><strong>Harvilleモデル</strong>：的中確率の推定に使用。1着が決まると残りの馬で2着争い、2着が決まると残りで3着争い…という条件付き確率を考慮した、より精密なモデルです。</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-[16px] md:text-lg font-medium text-blue-900">3. 2つのモデルの「ズレ」が期待値を動かす</h4>
                  <p>
                    市場モデルが算出するオッズと、Harvilleモデルが算出する確率の間にはズレがあります。
                    このズレが大きい組み合わせほど、期待値が0.75（払戻率）から乖離し、
                    割安な買い目（バリューベット）を見つけることが可能になります。
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 期待リターンの計算方法 */}
          <section className="space-y-4 !mt-10">
            <h3 className="text-xl font-semibold text-blue-800">期待リターンの計算方法</h3>

            {/* 計算ステップの説明 */}
            <ol className="list-decimal space-y-8 [&>li]:ml-[1.5em] [&>li]:pl-[0.5em]">
              <li className="font-medium">単勝オッズから各馬の理論的な勝率を推定</li>
            </ol>

            <div className="space-y-3">
              <div className="overflow-x-auto">
                <div className="w-full">
                  <BlockMath math="p_i = \frac{0.8}{o_i}" style={mathStyle} />
                </div>
              </div>
              <div className="bg-gray-100/80 p-4 rounded-xl space-y-2">
                <ul className="list-disc list-inside space-y-1 ml-4 [&>li]:marker:mr-[10px]">
                  <li><InlineMath math="p_i" />：<InlineMath math="i" />番の馬の推定勝率</li>
                  <li><InlineMath math="o_i" />：<InlineMath math="i" />番の馬の単勝オッズ</li>
                  <li>0.8は単勝市場の払戻率80%を表します。</li>
                </ul>
              </div>
            </div>

            <ol className="list-decimal space-y-8 [&>li]:ml-[1.5em] [&>li]:pl-[0.5em]" start={2}>
              <li className="font-medium">推定勝率を正規化（全馬の勝率の合計を1にする）</li>
            </ol>

            <div className="space-y-3">
              <p>全馬の勝率の合計が100%になるように調整します。</p>
              <div className="overflow-x-auto">
                <div className="w-full">
                  <BlockMath math="p_{i\_\text{norm}} = \frac{p_i}{\sum p_i}" style={mathStyle} />
                </div>
              </div>
            </div>

            <ol className="list-decimal space-y-8 [&>li]:ml-[1.5em] [&>li]:pl-[0.5em]" start={3}>
              <li className="font-medium">市場モデル：3連複オッズを推定するための確率を計算</li>
            </ol>

            <div className="space-y-3">
              <p>市場は3連複の確率を、各馬の勝率の単純な積で近似していると仮定します。</p>
              <div className="overflow-x-auto">
                <div className="w-full">
                  <BlockMath
                    math="P^{\text{naive}}_{ijk} = p_{i\_\text{norm}} \times p_{j\_\text{norm}} \times p_{k\_\text{norm}}"
                    style={longMathStyle}
                  />
                </div>
              </div>
              <p>正規化を行い、3連複オッズを推定します。</p>
              <div className="overflow-x-auto">
                <div className="w-full">
                  <BlockMath math="O_{ijk} = \frac{0.75}{\hat{P}^{\text{naive}}_{ijk}}" style={mathStyle} />
                </div>
              </div>
              <div className="bg-gray-100/80 p-4 rounded-xl space-y-2">
                <ul className="list-disc list-inside space-y-1 ml-4 [&>li]:marker:mr-[10px]">
                  <li><InlineMath math="\hat{P}^{\text{naive}}_{ijk}" />：正規化後の市場モデル確率</li>
                  <li><InlineMath math="O_{ijk}" />：推定3連複オッズ（0.75は払戻率75%）</li>
                </ul>
              </div>
            </div>

            <ol className="list-decimal space-y-8 [&>li]:ml-[1.5em] [&>li]:pl-[0.5em]" start={4}>
              <li className="font-medium">Harvilleモデル：より精密な的中確率を計算</li>
            </ol>

            <div className="space-y-3">
              <div className="rounded-xl bg-blue-100/50 p-4 md:p-6 space-y-3">
                <h4 className="text-[16px] md:text-lg font-medium text-blue-900">Harvilleモデルとは</h4>
                <p>
                  単純積モデルは「各馬が独立に3着以内に入る」と仮定しますが、
                  実際のレースでは<strong>1着が決まるとその馬はプールから消え</strong>、残りの馬で2着を争います。
                  Harvilleモデルはこの「脱落」の過程を条件付き確率で表現します。
                </p>
              </div>
              <p>特定の着順（1着=<InlineMath math="i" />, 2着=<InlineMath math="j" />, 3着=<InlineMath math="k" />）の確率：</p>
              <div className="overflow-x-auto">
                <div className="w-full">
                  <BlockMath
                    math="P(i,j,k) = p_i \times \frac{p_j}{1 - p_i} \times \frac{p_k}{1 - p_i - p_j}"
                    style={longMathStyle}
                  />
                </div>
              </div>
              <div className="bg-gray-100/80 p-4 rounded-xl space-y-2">
                <ul className="list-disc list-inside space-y-1 ml-4 [&>li]:marker:mr-[10px]">
                  <li><InlineMath math="p_i" />：<InlineMath math="i" />が全馬の中で1着になる確率</li>
                  <li><InlineMath math="\frac{p_j}{1 - p_i}" />：<InlineMath math="i" />が抜けた後、残りの中で<InlineMath math="j" />が最速になる確率</li>
                  <li><InlineMath math="\frac{p_k}{1 - p_i - p_j}" />：<InlineMath math="i, j" />が抜けた後、残りの中で<InlineMath math="k" />が最速になる確率</li>
                </ul>
              </div>
              <p>3連複は順不同なので、6つの順列の合計を取ります：</p>
              <div className="overflow-x-auto">
                <div className="w-full">
                  <BlockMath
                    math="P^{\text{H}}_{ijk} = \sum_{\pi \in S_3} P(\pi_1, \pi_2, \pi_3)"
                    style={mathStyle}
                  />
                </div>
              </div>
              <div className="bg-gray-100/80 p-4 rounded-xl">
                <ul className="list-disc list-inside space-y-1 ml-4 [&>li]:marker:mr-[10px]">
                  <li><InlineMath math="S_3" />：<InlineMath math="(i, j, k)" />の6通りの順列</li>
                  <li><InlineMath math="\hat{P}^{\text{H}}_{ijk}" />：正規化後のHarville確率（的中確率の推定値）</li>
                </ul>
              </div>
            </div>

            <ol className="list-decimal space-y-8 [&>li]:ml-[1.5em] [&>li]:pl-[0.5em]" start={5}>
              <li className="font-medium">期待リターンの計算</li>
            </ol>

            <div className="space-y-3">
              <p>各組み合わせの掛け金に推定オッズを掛けることで、的中時の払戻金額を計算します。</p>
              <div className="overflow-x-auto">
                <div className="w-full">
                  <BlockMath math="R_{ijk} = S_{ijk} \times O_{ijk}" style={mathStyle} />
                </div>
              </div>
              <div className="bg-gray-100/80 p-4 rounded-xl">
                <ul className="list-disc list-inside space-y-1 ml-4 [&>li]:marker:mr-[10px]">
                  <li><InlineMath math="R_{ijk}" />：各組み合わせの的中時の払戻金額</li>
                  <li><InlineMath math="S_{ijk}" />：各組み合わせへの掛け金</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 難易度加重について */}
          <section className="space-y-4 !mt-10">
            <h3 className="text-xl font-semibold text-blue-800">期待値の計算</h3>
            <ol className="list-decimal space-y-8 [&>li]:ml-[1.5em] [&>li]:pl-[0.5em]" start={6}>
              <li className="font-medium">Harville確率による加重期待リターン</li>
            </ol>

            <div className="space-y-4">
              <p>
                各組み合わせの払戻金額を、<strong>Harville確率</strong>で加重して合計します。
                オッズの算出に使った市場モデルとは異なるモデルの確率で加重するため、
                期待値は0.75に固定されず、組み合わせと重み配分によって変動します。
              </p>
              <div className="overflow-x-auto">
                <div className="w-full">
                  <BlockMath
                    math="R = \sum (R_{ijk} \times \hat{P}^{\text{H}}_{ijk})"
                    style={longMathStyle}
                  />
                </div>
              </div>
            </div>

            <ol className="list-decimal space-y-8 [&>li]:ml-[1.5em] [&>li]:pl-[0.5em]" start={7}>
              <li className="font-medium">期待値の計算</li>
            </ol>

            <div className="space-y-4">
              <div className="overflow-x-auto">
                <div className="w-full">
                  <BlockMath math="EV = \frac{R}{\sum S_{ijk}} = \frac{\sum (S_{ijk} \times O_{ijk} \times \hat{P}^{\text{H}}_{ijk})}{\sum S_{ijk}}" style={longMathStyle} />
                </div>
              </div>
              <p>
                オッズの式を代入すると：
              </p>
              <div className="overflow-x-auto">
                <div className="w-full">
                  <BlockMath
                    math="EV = 0.75 \times \frac{\sum (S_{ijk} \times \hat{P}^{\text{H}}_{ijk} \;/\; \hat{P}^{\text{naive}}_{ijk})}{\sum S_{ijk}}"
                    style={longMathStyle}
                  />
                </div>
              </div>
              <div className="rounded-xl bg-blue-100/50 p-4 md:p-6 space-y-3">
                <p>
                  <InlineMath math="\hat{P}^{\text{H}}_{ijk} \neq \hat{P}^{\text{naive}}_{ijk}" /> なので、比率 <InlineMath math="\hat{P}^{\text{H}}_{ijk} / \hat{P}^{\text{naive}}_{ijk}" /> は組み合わせごとに異なります。
                  この比率が1より大きい組み合わせは「市場が過小評価しているバリューベット」、
                  1より小さい組み合わせは「市場が過大評価している割高な買い目」と解釈できます。
                </p>
              </div>
              <div className="rounded-xl bg-gray-100/80 p-4 space-y-3">
                <ul className="list-disc list-inside space-y-1 ml-4 [&>li]:marker:mr-[10px]">
                  <li><InlineMath math="EV" />：期待値（重み配分によって変動する）</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  )
}
