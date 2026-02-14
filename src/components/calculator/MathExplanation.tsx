"use client"

import { Card, CardContent } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'
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
    <Card className="mb-10 card-elevated-lg border-0 rounded-2xl overflow-hidden bg-white">
      <CardContent className="p-0">
        {/* Header */}
        <div className="px-6 py-4 md:px-8 md:py-5 border-b border-slate-100 bg-gradient-to-r from-slate-800 to-slate-700">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10">
              <BookOpen className="h-5 w-5 text-amber-300" />
            </div>
            <span className="font-serif text-lg md:text-xl font-semibold text-white">
              計算方法の解説
            </span>
          </div>
        </div>

        <div className="space-y-6 p-5 md:p-8">
          <div className="space-y-6">
            {/* 概要 */}
            <section className="space-y-4">
              <h3 className="text-xl font-serif font-semibold text-slate-800">文系でもわかる仕組みの概要</h3>
              <div className="space-y-4">
                <div className="rounded-xl bg-amber-50/60 border border-amber-100/80 p-4 md:p-6 space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-[16px] md:text-lg font-medium text-slate-800">1. 2種類のオッズから確率を推定</h4>
                    <p className="text-slate-600">
                      このツールは<strong className="text-slate-800">単勝オッズ</strong>と<strong className="text-slate-800">複勝オッズ</strong>の2種類を使います。
                      単勝オッズはその馬が1着になる確率を、複勝オッズは3着以内に来る確率を反映しています。
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[16px] md:text-lg font-medium text-slate-800">2. 「安定度」で3連複向きの馬を判定</h4>
                    <p className="text-slate-600">
                      単勝オッズを複勝オッズで割ると「安定度」が算出されます。
                      安定度が高い馬は「勝ち切れないが3着以内には来やすい」馬で、3連複向きです。
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[16px] md:text-lg font-medium text-slate-800">3. 2つのモデルのズレからバリューを見つける</h4>
                    <p className="text-slate-600">
                      3連複のオッズ推定には<strong className="text-slate-800">単勝ベースの市場モデル</strong>を、
                      的中確率の推定には<strong className="text-slate-800">複勝ベースの確率モデル</strong>を使います。
                      この2つのモデルのズレが大きい組み合わせほど、割安な買い目（バリューベット）が見つかります。
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[16px] md:text-lg font-medium text-slate-800">4. 2軸で組み合わせを評価</h4>
                    <p className="text-slate-600">
                      各組み合わせを「的中確率が高いか低いか」と「割安か割高か」の2軸で4つのカテゴリに分類し、
                      推奨度を判定します。結果はリアルタイムで自動計算されます。
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 計算方法 */}
            <section className="space-y-4 !mt-10">
              <h3 className="text-xl font-serif font-semibold text-slate-800">計算方法の詳細</h3>

              <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 mb-4">
                <p className="text-sm text-slate-500">
                  レースデータをインポートすると、選択中の馬（3頭以上）から全ての3連複の組み合わせを自動計算します。
                  馬の選択を変更するたびにリアルタイムで結果が更新されます。
                  1買い目あたりの掛け金は100円として計算しています。
                </p>
              </div>

              <ol className="list-decimal space-y-8 [&>li]:ml-[1.5em] [&>li]:pl-[0.5em]">
                <li className="font-medium text-slate-800">単勝オッズから各馬の勝率を推定（市場モデル用）</li>
              </ol>

              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <div className="w-full">
                    <BlockMath math="p^{\text{win}}_i = \frac{0.8}{o^{\text{win}}_i}" style={mathStyle} />
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
                  <ul className="list-disc list-inside space-y-1 ml-4 [&>li]:marker:mr-[10px] text-slate-600">
                    <li><InlineMath math="p^{\text{win}}_i" />：<InlineMath math="i" />番の馬の推定勝率</li>
                    <li><InlineMath math="o^{\text{win}}_i" />：<InlineMath math="i" />番の馬の単勝オッズ</li>
                    <li>0.8は単勝市場の払戻率80%を表します。</li>
                  </ul>
                </div>
              </div>

              <ol className="list-decimal space-y-8 [&>li]:ml-[1.5em] [&>li]:pl-[0.5em]" start={2}>
                <li className="font-medium text-slate-800">複勝オッズから各馬の3着以内確率を推定（確率モデル用）</li>
              </ol>

              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <div className="w-full">
                    <BlockMath math="p^{\text{place}}_i = \frac{0.8}{(o^{\text{place-low}}_i + o^{\text{place-high}}_i) \;/\; 2}" style={longMathStyle} />
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
                  <ul className="list-disc list-inside space-y-1 ml-4 [&>li]:marker:mr-[10px] text-slate-600">
                    <li><InlineMath math="p^{\text{place}}_i" />：<InlineMath math="i" />番の馬の推定3着以内確率</li>
                    <li>複勝オッズは範囲（低〜高）で提供されるため、中央値を使用します。</li>
                  </ul>
                </div>
              </div>

              <ol className="list-decimal space-y-8 [&>li]:ml-[1.5em] [&>li]:pl-[0.5em]" start={3}>
                <li className="font-medium text-slate-800">安定度の算出</li>
              </ol>

              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <div className="w-full">
                    <BlockMath math="\text{stability}_i = \frac{o^{\text{win}}_i}{(o^{\text{place-low}}_i + o^{\text{place-high}}_i) \;/\; 2}" style={longMathStyle} />
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
                  <ul className="list-disc list-inside space-y-1 ml-4 [&>li]:marker:mr-[10px] text-slate-600">
                    <li>安定度が高い馬 = 「1着には来にくいが3着以内には来やすい」馬（3連複向き）</li>
                    <li>安定度が低い馬 = 「1着になるか惨敗か」という一発勝負タイプの馬</li>
                  </ul>
                </div>
              </div>

              <ol className="list-decimal space-y-8 [&>li]:ml-[1.5em] [&>li]:pl-[0.5em]" start={4}>
                <li className="font-medium text-slate-800">正規化と市場モデル（3連複オッズの推定）</li>
              </ol>

              <div className="space-y-3">
                <p className="text-slate-600">勝率・3着以内確率のそれぞれを正規化し、合計が1になるようにします。</p>
                <div className="overflow-x-auto">
                  <div className="w-full">
                    <BlockMath math="\hat{p}^{\text{win}}_i = \frac{p^{\text{win}}_i}{\sum p^{\text{win}}_i}, \quad \hat{p}^{\text{place}}_i = \frac{p^{\text{place}}_i}{\sum p^{\text{place}}_i}" style={longMathStyle} />
                  </div>
                </div>
                <p className="text-slate-600">市場モデル（単勝ベース）で3連複のオッズを推定します。</p>
                <div className="overflow-x-auto">
                  <div className="w-full">
                    <BlockMath
                      math="P^{\text{market}}_{ijk} = \hat{p}^{\text{win}}_i \times \hat{p}^{\text{win}}_j \times \hat{p}^{\text{win}}_k"
                      style={longMathStyle}
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <div className="w-full">
                    <BlockMath math="O_{ijk} = \frac{0.75}{\hat{P}^{\text{market}}_{ijk}}" style={mathStyle} />
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
                  <ul className="list-disc list-inside space-y-1 ml-4 [&>li]:marker:mr-[10px] text-slate-600">
                    <li><InlineMath math="\hat{P}^{\text{market}}_{ijk}" />：正規化後の市場モデル確率</li>
                    <li><InlineMath math="O_{ijk}" />：推定3連複オッズ（0.75は3連複の払戻率75%）</li>
                  </ul>
                </div>
              </div>

              <ol className="list-decimal space-y-8 [&>li]:ml-[1.5em] [&>li]:pl-[0.5em]" start={5}>
                <li className="font-medium text-slate-800">確率モデル（複勝ベースの的中確率）</li>
              </ol>

              <div className="space-y-3">
                <p className="text-slate-600">複勝確率ベースの3連複の的中確率を推定します。</p>
                <div className="overflow-x-auto">
                  <div className="w-full">
                    <BlockMath
                      math="P^{\text{ours}}_{ijk} = \hat{p}^{\text{place}}_i \times \hat{p}^{\text{place}}_j \times \hat{p}^{\text{place}}_k"
                      style={longMathStyle}
                    />
                  </div>
                </div>
                <div className="rounded-xl bg-amber-50/60 border border-amber-100/80 p-4 md:p-6 space-y-3">
                  <p className="text-slate-700">
                    ポイントは、オッズの推定（市場モデル）と的中確率の推定（確率モデル）に<strong className="text-slate-800">異なる確率</strong>を使っていることです。
                    市場モデルは<strong className="text-slate-800">単勝オッズ</strong>から、確率モデルは<strong className="text-slate-800">複勝オッズ</strong>から導出しています。
                    この2つの確率のズレが、バリューベットを見つける鍵です。
                  </p>
                </div>
              </div>
            </section>

            {/* 回収率の計算 */}
            <section className="space-y-4 !mt-10">
              <h3 className="text-xl font-serif font-semibold text-slate-800">回収率の計算</h3>

              <ol className="list-decimal space-y-8 [&>li]:ml-[1.5em] [&>li]:pl-[0.5em]" start={6}>
                <li className="font-medium text-slate-800">各組み合わせの回収率</li>
              </ol>

              <div className="space-y-4">
                <p className="text-slate-600">
                  1買い目あたり100円を掛ける前提で、各組み合わせの回収率を計算します。
                </p>
                <div className="overflow-x-auto">
                  <div className="w-full">
                    <BlockMath
                      math="\text{回収率}_{ijk} = 0.75 \times \frac{\hat{P}^{\text{ours}}_{ijk}}{\hat{P}^{\text{market}}_{ijk}}"
                      style={longMathStyle}
                    />
                  </div>
                </div>
                <div className="rounded-xl bg-amber-50/60 border border-amber-100/80 p-4 md:p-6 space-y-3">
                  <p className="text-slate-700">
                    回収率は「100円を掛けた場合に平均で何円返ってくるか」を示します。
                    回収率100%なら損益分岐点（100円掛けて100円返ってくる）、
                    100%を超えると利益が見込める組み合わせです。
                  </p>
                  <p className="text-slate-700">
                    結果画面では回収率を<strong className="text-slate-800">パーセント（%）</strong>で表示しています。
                    例えば「回収率 150%」は、100円掛けて期待値として150円の払い戻しが見込めることを意味します。
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-2">
                  <ul className="list-disc list-inside space-y-1 ml-4 [&>li]:marker:mr-[10px] text-slate-600">
                    <li>回収率 100%以上 → <span className="text-emerald-600 font-medium">緑色</span>で表示（利益が見込める）</li>
                    <li>回収率 100%未満 → <span className="text-rose-500 font-medium">赤色</span>で表示（損失が見込まれる）</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 2軸推奨度分類 */}
            <section className="space-y-4 !mt-10">
              <h3 className="text-xl font-serif font-semibold text-slate-800">2軸推奨度分類</h3>

              <ol className="list-decimal space-y-8 [&>li]:ml-[1.5em] [&>li]:pl-[0.5em]" start={7}>
                <li className="font-medium text-slate-800">的中確率 × 割安度の2軸で4段階に分類</li>
              </ol>

              <div className="space-y-4">
                <p className="text-slate-600">
                  各組み合わせを2つの軸で評価し、全組み合わせの中央値と比較して4つのカテゴリに分類します。
                </p>

                <div className="rounded-xl bg-amber-50/60 border border-amber-100/80 p-4 md:p-6 space-y-3">
                  <h4 className="text-[16px] md:text-lg font-medium text-slate-800">軸1: 的中確率（複勝ベース）</h4>
                  <p className="text-slate-600">
                    複勝オッズから推定した3着以内確率の積です。
                    中央値より高ければ「的中確率が高い」と判定します。
                  </p>
                </div>

                <div className="rounded-xl bg-amber-50/60 border border-amber-100/80 p-4 md:p-6 space-y-3">
                  <h4 className="text-[16px] md:text-lg font-medium text-slate-800">軸2: 割安度（安定度積）</h4>
                  <div className="overflow-x-auto">
                    <div className="w-full">
                      <BlockMath
                        math="\text{comboStability}_{ijk} = \text{stability}_i \times \text{stability}_j \times \text{stability}_k"
                        style={longMathStyle}
                      />
                    </div>
                  </div>
                  <p className="text-slate-600">
                    3頭の安定度の積です。安定度の高い馬が集まった組み合わせほどこの値が大きくなり、
                    「3連複向き」の組み合わせと判定されます。中央値より高ければ「割安」と判定します。
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 md:p-6 space-y-3">
                  <h4 className="text-[16px] md:text-lg font-medium text-slate-800">4つのカテゴリ</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <div className="flex items-start gap-2">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 font-semibold text-sm whitespace-nowrap">推奨</span>
                      <span className="text-sm text-slate-600">的中確率 ≥ 中央値 かつ 安定度積 ≥ 中央値。当たりやすく割安。</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-sky-100 text-sky-700 font-semibold text-sm whitespace-nowrap">堅実</span>
                      <span className="text-sm text-slate-600">的中確率 ≥ 中央値 かつ 安定度積 &lt; 中央値。当たりやすいが割高。</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-amber-100 text-amber-700 font-semibold text-sm whitespace-nowrap">穴狙い</span>
                      <span className="text-sm text-slate-600">的中確率 &lt; 中央値 かつ 安定度積 ≥ 中央値。当たりにくいが割安。</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 font-semibold text-sm whitespace-nowrap">非推奨</span>
                      <span className="text-sm text-slate-600">的中確率 &lt; 中央値 かつ 安定度積 &lt; 中央値。当たりにくく割高。</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Harvilleフォールバック */}
            <section className="space-y-4 !mt-10">
              <h3 className="text-xl font-serif font-semibold text-slate-800">補足: 複勝オッズがない場合（Harvilleモデル）</h3>

              <div className="space-y-3">
                <div className="rounded-xl bg-amber-50/60 border border-amber-100/80 p-4 md:p-6 space-y-3">
                  <p className="text-slate-700">
                    複勝オッズが取得できないレースの場合は、単勝オッズのみでフォールバック計算を行います。
                    この場合、オッズの推定には<strong className="text-slate-800">単純積モデル</strong>を、
                    確率の推定には<strong className="text-slate-800">Harvilleモデル</strong>（条件付き確率）を使います。
                  </p>
                </div>

                <div className="rounded-xl bg-amber-50/60 border border-amber-100/80 p-4 md:p-6 space-y-3">
                  <h4 className="text-[16px] md:text-lg font-medium text-slate-800">Harvilleモデルとは</h4>
                  <p className="text-slate-600">
                    単純積モデルは「各馬が独立に3着以内に入る」と仮定しますが、
                    実際のレースでは<strong className="text-slate-800">1着が決まるとその馬はプールから消え</strong>、残りの馬で2着を争います。
                    Harvilleモデルはこの「脱落」の過程を条件付き確率で表現します。
                  </p>
                </div>
                <p className="text-slate-600">特定の着順（1着=<InlineMath math="i" />, 2着=<InlineMath math="j" />, 3着=<InlineMath math="k" />）の確率：</p>
                <div className="overflow-x-auto">
                  <div className="w-full">
                    <BlockMath
                      math="P(i,j,k) = p_i \times \frac{p_j}{1 - p_i} \times \frac{p_k}{1 - p_i - p_j}"
                      style={longMathStyle}
                    />
                  </div>
                </div>
                <p className="text-slate-600">3連複は順不同なので、6つの順列の合計を取ります：</p>
                <div className="overflow-x-auto">
                  <div className="w-full">
                    <BlockMath
                      math="P^{\text{H}}_{ijk} = \sum_{\pi \in S_3} P(\pi_1, \pi_2, \pi_3)"
                      style={mathStyle}
                    />
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                  <ul className="list-disc list-inside space-y-1 ml-4 [&>li]:marker:mr-[10px] text-slate-600">
                    <li>フォールバック時は2軸分類ではなく、回収率と確率による1軸分類を使用します。</li>
                    <li>回収率 ≥ 100% かつ 確率 ≥ 中央値 → 推奨、回収率 ≥ 100% かつ確率 &lt; 中央値 → 穴狙い</li>
                    <li>回収率 ≥ 90% → 堅実、それ以下 → 非推奨</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
