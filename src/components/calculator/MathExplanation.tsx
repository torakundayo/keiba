"use client"

import Link from 'next/link'
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
}

const longMathStyle = {
  fontSize: '1em',
}

export function MathExplanation() {
  return (
    <article className="space-y-10">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">計算方法の解説</h1>
        <p className="text-sm text-slate-400 mt-1">
          このツールがどのように確率を推定しているかの数理的な説明
        </p>
      </header>

      {/* 前提知識: パリミュチュエル方式 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">前提: JRAのオッズの仕組み</h2>

        <div className="space-y-3 text-sm text-slate-600">
          <p>
            JRAの馬券は<strong className="text-slate-800">パリミュチュエル方式</strong>（投票プール方式）を採用しています。
            ブックメーカーのように事前にオッズが固定されるのではなく、全ての購入者の投票総額からオッズが決まります。
          </p>
          <div className="pl-4 border-l-2 border-slate-200 space-y-2">
            <p>
              <strong className="text-slate-700">仕組み:</strong> 全購入者の投票総額から、まずJRAが<strong className="text-slate-800">控除率</strong>（テラ銭）を差し引きます。
              残りを的中者で山分けするため、オッズは「その馬券にどれだけの人が賭けたか」で決まります。
            </p>
            <p>
              <strong className="text-slate-700">控除率:</strong> 馬券種によって異なります。
            </p>
            <div className="overflow-x-auto">
              <table className="text-xs text-slate-600 w-full">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400">
                    <th className="text-left py-1 pr-4">馬券種</th>
                    <th className="text-right py-1 px-4">控除率</th>
                    <th className="text-right py-1 pl-4">払戻率</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-50">
                    <td className="py-1 pr-4">単勝・複勝</td>
                    <td className="text-right py-1 px-4 tabular-nums">20%</td>
                    <td className="text-right py-1 pl-4 tabular-nums">80%</td>
                  </tr>
                  <tr className="border-b border-slate-50">
                    <td className="py-1 pr-4">馬連・ワイド</td>
                    <td className="text-right py-1 px-4 tabular-nums">22.5%</td>
                    <td className="text-right py-1 pl-4 tabular-nums">77.5%</td>
                  </tr>
                  <tr className="border-b border-slate-50">
                    <td className="py-1 pr-4 font-medium">3連複</td>
                    <td className="text-right py-1 px-4 tabular-nums font-medium">25%</td>
                    <td className="text-right py-1 pl-4 tabular-nums font-medium">75%</td>
                  </tr>
                  <tr>
                    <td className="py-1 pr-4">3連単</td>
                    <td className="text-right py-1 px-4 tabular-nums">27.5%</td>
                    <td className="text-right py-1 pl-4 tabular-nums">72.5%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              つまり3連複の場合、全ての組み合わせを均等に買うと<strong className="text-slate-800">必ず75%しか返ってこない</strong>設計です。
              これがこのツールの「75%の壁」の正体です。
            </p>
          </div>
          <p>
            <strong className="text-slate-700">オッズの意味:</strong> オッズは「市場参加者の集合知」です。
            過去成績・血統・調教タイム・天候・馬場状態・騎手の力量など、あらゆる公開情報を
            市場参加者が自分の資金を使って評価した結果がオッズに反映されています。
            これが後述する「市場効率仮説」の根拠です。
          </p>
        </div>
      </section>

      {/* 概要 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">仕組みの概要</h2>

        <div className="space-y-3 text-sm text-slate-600">
          <div>
            <h3 className="font-medium text-slate-700">1. 2種類のオッズから確率を推定</h3>
            <p className="mt-1">
              <strong className="text-slate-800">単勝オッズ</strong>と<strong className="text-slate-800">複勝オッズ</strong>の2種類を使います。
              単勝オッズはその馬が1着になる確率を、複勝オッズは3着以内に来る確率を反映しています。
            </p>
          </div>
          <div>
            <h3 className="font-medium text-slate-700">2. 2つのモデルのズレからバリューを見つける</h3>
            <p className="mt-1">
              3連複のオッズ推定には<strong className="text-slate-800">単勝ベースの市場モデル</strong>を、
              的中確率の推定には<strong className="text-slate-800">複勝ベースの確率モデル</strong>を使います。
              この2つのモデルのズレが大きい組み合わせほど、相対的に有利な買い目です。
            </p>
          </div>
          <div>
            <h3 className="font-medium text-slate-700">3. 確率順にランク付け</h3>
            <p className="mt-1">
              全ての組み合わせを的中確率の高い順にランク付けします。
              バックテストでは、上位3通りで21%、上位10通りで39%の的中率を確認しています。
              購入点数を増やすと的中率は上がりますが、1点あたりの回収率は下がります。
            </p>
          </div>
        </div>

        {/* なぜ2つのデータソースが必要か */}
        <div className="pl-4 border-l-2 border-slate-200 space-y-2 text-sm text-slate-600">
          <p className="font-medium text-slate-700">なぜ2つのオッズを使うのか？</p>
          <p>
            もし単勝オッズだけで「確率」も「オッズ」も推定すると、回収率は数学的に必ず75%に固定されます。
            確率とオッズが同じデータから出ているので、計算中に打ち消し合ってしまうのです
            （詳細は<Link href="/insight" className="text-slate-800 underline underline-offset-2">考察ページ</Link>を参照）。
          </p>
          <p>
            これを避けるために、<strong className="text-slate-800">オッズの推定には単勝</strong>、
            <strong className="text-slate-800">確率の推定には複勝</strong>という別々のデータソースを使います。
            単勝は「1着確率」、複勝は「3着以内確率」を反映しており、
            この2つの市場の評価のズレが組み合わせごとの回収率の差を生み出します。
          </p>
        </div>
      </section>

      {/* 具体例 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">具体例で理解する</h2>
        <p className="text-sm text-slate-500">
          14頭立てのレースで、馬A・B・Cの3頭に注目した場合の計算例です。
        </p>

        <div className="overflow-x-auto">
          <table className="text-sm text-slate-600 w-full">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-400">
                <th className="text-left py-1.5 pr-3">馬</th>
                <th className="text-right py-1.5 px-3">単勝オッズ</th>
                <th className="text-right py-1.5 px-3">推定勝率</th>
                <th className="text-right py-1.5 px-3">複勝オッズ</th>
                <th className="text-right py-1.5 pl-3">推定3着内率</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-50">
                <td className="py-1.5 pr-3 font-medium">馬A（1番人気）</td>
                <td className="text-right py-1.5 px-3 tabular-nums">3.5倍</td>
                <td className="text-right py-1.5 px-3 tabular-nums">22.9%</td>
                <td className="text-right py-1.5 px-3 tabular-nums">1.3〜1.8倍</td>
                <td className="text-right py-1.5 pl-3 tabular-nums">51.6%</td>
              </tr>
              <tr className="border-b border-slate-50">
                <td className="py-1.5 pr-3 font-medium">馬B（3番人気）</td>
                <td className="text-right py-1.5 px-3 tabular-nums">8.0倍</td>
                <td className="text-right py-1.5 px-3 tabular-nums">10.0%</td>
                <td className="text-right py-1.5 px-3 tabular-nums">2.0〜3.5倍</td>
                <td className="text-right py-1.5 pl-3 tabular-nums">29.1%</td>
              </tr>
              <tr>
                <td className="py-1.5 pr-3 font-medium">馬C（8番人気）</td>
                <td className="text-right py-1.5 px-3 tabular-nums">25.0倍</td>
                <td className="text-right py-1.5 px-3 tabular-nums">3.2%</td>
                <td className="text-right py-1.5 px-3 tabular-nums">4.0〜8.0倍</td>
                <td className="text-right py-1.5 pl-3 tabular-nums">13.3%</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="pl-4 border-l-2 border-slate-200 space-y-2 text-sm text-slate-600">
          <p>
            <strong className="text-slate-700">推定勝率の計算:</strong> 馬Aの場合、0.8 / 3.5 = 22.9%（0.8は単勝の払戻率80%）
          </p>
          <p>
            <strong className="text-slate-700">推定3着内率の計算:</strong> 馬Aの場合、0.8 / ((1.3 + 1.8) / 2) = 0.8 / 1.55 = 51.6%
          </p>
          <p>
            <strong className="text-slate-700">注目ポイント:</strong> 馬Cは単勝オッズ25倍（勝率3.2%）ですが、
            複勝オッズでは3着以内確率13.3%と評価されています。
            この「単勝での評価と複勝での評価のズレ」が組み合わせの回収率に影響します。
          </p>
        </div>
      </section>

      {/* 計算方法の詳細 */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-slate-800">計算方法の詳細</h2>

        <p className="text-sm text-slate-500">
          レースデータをインポートすると、選択中の馬（3頭以上）から全ての3連複の組み合わせを自動計算します。
          1買い目あたりの掛け金は100円として計算しています。
        </p>

        {/* Step 1 */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-800">1. 単勝オッズから各馬の勝率を推定（市場モデル用）</h3>
          <div className="overflow-x-auto">
            <BlockMath math="p^{\text{win}}_i = \frac{0.8}{o^{\text{win}}_i}" style={mathStyle} />
          </div>
          <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc list-inside">
            <li><InlineMath math="p^{\text{win}}_i" />：<InlineMath math="i" />番の馬の推定勝率</li>
            <li><InlineMath math="o^{\text{win}}_i" />：<InlineMath math="i" />番の馬の単勝オッズ</li>
            <li>0.8は単勝市場の払戻率80%を表します。</li>
          </ul>
        </div>

        {/* Step 2 */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-800">2. 複勝オッズから各馬の3着以内確率を推定（確率モデル用）</h3>
          <div className="overflow-x-auto">
            <BlockMath math="p^{\text{place}}_i = \frac{0.8}{(o^{\text{place-low}}_i + o^{\text{place-high}}_i) \;/\; 2}" style={longMathStyle} />
          </div>
          <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc list-inside">
            <li><InlineMath math="p^{\text{place}}_i" />：<InlineMath math="i" />番の馬の推定3着以内確率</li>
            <li>複勝オッズは範囲（低〜高）で提供されるため、中央値を使用します。</li>
          </ul>
        </div>

        {/* Step 3 */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-800">3. 正規化と市場モデル（3連複オッズの推定）</h3>
          <p className="text-sm text-slate-600">勝率・3着以内確率のそれぞれを正規化し、合計が1になるようにします。</p>
          <div className="overflow-x-auto">
            <BlockMath math="\hat{p}^{\text{win}}_i = \frac{p^{\text{win}}_i}{\sum p^{\text{win}}_i}, \quad \hat{p}^{\text{place}}_i = \frac{p^{\text{place}}_i}{\sum p^{\text{place}}_i}" style={longMathStyle} />
          </div>
          <p className="text-sm text-slate-600">市場モデル（単勝ベース）で3連複のオッズを推定します。</p>
          <div className="overflow-x-auto">
            <BlockMath
              math="P^{\text{market}}_{ijk} = \hat{p}^{\text{win}}_i \times \hat{p}^{\text{win}}_j \times \hat{p}^{\text{win}}_k"
              style={longMathStyle}
            />
          </div>
          <div className="overflow-x-auto">
            <BlockMath math="O_{ijk} = \frac{0.75}{\hat{P}^{\text{market}}_{ijk}}" style={mathStyle} />
          </div>
          <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc list-inside">
            <li><InlineMath math="\hat{P}^{\text{market}}_{ijk}" />：正規化後の市場モデル確率</li>
            <li><InlineMath math="O_{ijk}" />：推定3連複オッズ（0.75は3連複の払戻率75%）</li>
          </ul>
        </div>

        {/* Step 4 */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-800">4. 確率モデル（複勝ベースの的中確率）</h3>
          <p className="text-sm text-slate-600">複勝確率ベースの3連複の的中確率を推定します。</p>
          <div className="overflow-x-auto">
            <BlockMath
              math="P^{\text{ours}}_{ijk} = \hat{p}^{\text{place}}_i \times \hat{p}^{\text{place}}_j \times \hat{p}^{\text{place}}_k"
              style={longMathStyle}
            />
          </div>
          <p className="text-sm text-slate-600">
            ポイントは、オッズの推定（市場モデル）と的中確率の推定（確率モデル）に<strong className="text-slate-800">異なる確率</strong>を使っていることです。
            市場モデルは<strong className="text-slate-800">単勝オッズ</strong>から、確率モデルは<strong className="text-slate-800">複勝オッズ</strong>から導出しています。
          </p>
        </div>
      </section>

      {/* 期待回収率の計算 */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold text-slate-800">期待回収率とランク付け</h2>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-800">5. 各組み合わせの期待回収率</h3>
          <div className="overflow-x-auto">
            <BlockMath
              math="\text{期待回収率}_{ijk} = 0.75 \times \frac{\hat{P}^{\text{ours}}_{ijk}}{\hat{P}^{\text{market}}_{ijk}}"
              style={longMathStyle}
            />
          </div>
          <p className="text-sm text-slate-600">
            期待回収率は「100円を掛けた場合に平均で何円返ってくるか」を示します。
            100%なら損益分岐点です。
          </p>
          <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc list-inside">
            <li>期待回収率 100%以上 → <span className="text-emerald-600 font-medium">緑色</span>で表示</li>
            <li>期待回収率 100%未満 → <span className="text-rose-500 font-medium">赤色</span>で表示</li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-800">6. 確率順ランク付け</h3>
          <p className="text-sm text-slate-600">
            全ての組み合わせを的中確率 <InlineMath math="P^{\text{ours}}_{ijk}" /> の高い順にランク付けします。
            バックテスト（774レース）での検証結果：
          </p>
          <ul className="text-sm text-slate-600 space-y-1 ml-4 list-disc list-inside">
            <li>的中した組み合わせの中央順位は16位（全体の約4%の位置）</li>
            <li>上位3通りで21.3%、上位10通りで39.1%の的中率</li>
            <li>ランダム選択と比較して26〜38倍の精度</li>
          </ul>
        </div>
      </section>

      {/* Harvilleフォールバック */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">補足: 複勝オッズがない場合（Harvilleモデル）</h2>

        <p className="text-sm text-slate-600">
          複勝オッズが取得できないレースでは、単勝オッズのみでフォールバック計算を行います。
          オッズの推定には<strong className="text-slate-800">単純積モデル</strong>を、
          確率の推定には<strong className="text-slate-800">Harvilleモデル</strong>（条件付き確率）を使います。
        </p>

        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            Harvilleモデルは「1着が決まるとその馬はプールから消え、残りの馬で2着を争う」という過程を条件付き確率で表現します。
          </p>
          <p className="text-sm text-slate-600">特定の着順（1着=<InlineMath math="i" />, 2着=<InlineMath math="j" />, 3着=<InlineMath math="k" />）の確率：</p>
          <div className="overflow-x-auto">
            <BlockMath
              math="P(i,j,k) = p_i \times \frac{p_j}{1 - p_i} \times \frac{p_k}{1 - p_i - p_j}"
              style={longMathStyle}
            />
          </div>
          <p className="text-sm text-slate-600">3連複は順不同なので、6つの順列の合計を取ります：</p>
          <div className="overflow-x-auto">
            <BlockMath
              math="P^{\text{H}}_{ijk} = \sum_{\pi \in S_3} P(\pi_1, \pi_2, \pi_3)"
              style={mathStyle}
            />
          </div>
        </div>
      </section>

      {/* 次のページへの導線 */}
      <section className="border-t border-slate-200 pt-6">
        <p className="text-sm text-slate-500">
          この計算方法で774レースを検証した結果は
          <Link href="/backtest" className="text-slate-800 underline underline-offset-2 mx-1">検証ページ</Link>
          で確認できます。なぜこのモデルで利益が出ないのかの理論的背景は
          <Link href="/insight" className="text-slate-800 underline underline-offset-2 mx-1">考察ページ</Link>
          で解説しています。
        </p>
      </section>
    </article>
  )
}
