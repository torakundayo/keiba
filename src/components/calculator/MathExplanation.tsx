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
          <span>なぜこの結果になるの？</span>
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
                  <div className="w-full">
                    <BlockMath math="P_i = C_i \times p_i" style={mathStyle} />
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
                  <div className="w-full">
                    <BlockMath math="P_i = C \times p_i" style={mathStyle} />
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

            {/* 計算ステップの説明 */}
            <p className="mt-8">これらの近似を踏まえ、具体的な計算手順は以下の通りです。</p>
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
                <div className="w-full">
                  <BlockMath math="p_{i\_\text{norm}} = \frac{p_i}{\sum p_i}" style={mathStyle} />
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
                <div className="w-full">
                  <BlockMath math="P_i = C \times p_{i\_\text{norm}}" style={mathStyle} />
                </div>
              </div>
              <p>近似➁より、各3頭組み合わせ<InlineMath math="(i, j, k)" />の的中確率を、3着以内確率の積として計算します。</p>
              <div className="overflow-x-auto">
                <div className="w-full">
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
                <div className="w-full">
                  <BlockMath math="P_{ijk\_\text{norm}} = \frac{P_{ijk}}{\sum P_{ijk}}" style={mathStyle} />
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
                <div className="w-full">
                  <BlockMath math="O_{ijk} = \frac{0.75}{P_{ijk\_\text{norm}}}" style={mathStyle} />
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
                <div className="w-full">
                  <BlockMath math="R_{ijk} = S_{ijk} \times O_{ijk}" style={mathStyle} />
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
                <div className="w-full">
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
                <div className="w-full">
                  <BlockMath math="EV = \frac{R}{\sum S_{ijk}}" style={longMathStyle} />
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
    </Card>
  )
}
