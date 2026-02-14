"use client"

import dynamic from 'next/dynamic'

const BlockMath = dynamic(() => import('react-katex').then(mod => mod.BlockMath), {
  ssr: false,
})
const InlineMath = dynamic(() => import('react-katex').then(mod => mod.InlineMath), {
  ssr: false,
})
import 'katex/dist/katex.min.css'

const longMathStyle = {
  fontSize: '1em',
  '@media (max-width: 768px)': {
    fontSize: '0.75em',
  },
}

export function InsightCard() {
  return (
    <article className="space-y-10">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">考察</h1>
        <p className="text-sm text-slate-400 mt-1">
          このモデルの理論的背景と限界について
        </p>
      </header>

      {/* なぜ単一モデルだと75%に固定されるか */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">なぜ単一モデルでは回収率が75%に固定されるのか</h2>
        <p className="text-slate-600">
          もし確率とオッズを同じモデルから導出すると、回収率は必ず75%（3連複の払戻率）に固定されます。
          これは数学的なトートロジー（同語反復）です。
        </p>

        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
          <h3 className="text-base font-medium text-slate-700">単一モデルの場合の計算過程</h3>
          <p className="text-slate-600">オッズと確率を同じ確率分布から導出すると：</p>
          <div className="overflow-x-auto">
            <BlockMath
              math="\text{回収率} = \frac{\sum (S_{ijk} \times \frac{0.75}{P_{ijk}} \times P_{ijk})}{\sum S_{ijk}} = \frac{0.75 \times \sum S_{ijk}}{\sum S_{ijk}} = 0.75"
              style={longMathStyle}
            />
          </div>
          <p className="text-slate-600">
            分子と分母の <InlineMath math="P_{ijk}" /> が完全に相殺されるため、
            どのような重み配分をしても回収率は変わりません。
            オッズを生成した情報と同じ情報で確率を評価しているので、新しい知見が入り込む余地がないのです。
          </p>
        </div>
      </section>

      {/* 2データソースアプローチ */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">単勝 × 複勝の2データソースアプローチ</h2>
        <p className="text-slate-600">
          このツールでは、<strong className="text-slate-800">単勝オッズ</strong>と<strong className="text-slate-800">複勝オッズ</strong>という異なるデータソースを使うことで、
          この問題を解決しています。
        </p>

        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
          <h3 className="text-base font-medium text-slate-700">市場モデル（オッズ推定用）：単勝オッズベース</h3>
          <div className="overflow-x-auto">
            <BlockMath
              math="P^{\text{market}}_{ijk} \propto \hat{p}^{\text{win}}_i \times \hat{p}^{\text{win}}_j \times \hat{p}^{\text{win}}_k"
              style={longMathStyle}
            />
          </div>
          <p className="text-slate-600">
            単勝オッズから導出した各馬の勝率の積。
            市場がこの近似でオッズを形成していると仮定して、3連複オッズを推定します。
          </p>
        </div>

        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
          <h3 className="text-base font-medium text-slate-700">確率モデル（的中確率推定用）：複勝オッズベース</h3>
          <div className="overflow-x-auto">
            <BlockMath
              math="P^{\text{ours}}_{ijk} \propto \hat{p}^{\text{place}}_i \times \hat{p}^{\text{place}}_j \times \hat{p}^{\text{place}}_k"
              style={longMathStyle}
            />
          </div>
          <p className="text-slate-600">
            複勝オッズから導出した3着以内確率の積。
            3着以内という3連複に直結する情報を持つ複勝市場のデータを利用して、的中確率を推定します。
          </p>
        </div>

        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
          <h3 className="text-base font-medium text-slate-700">2つのデータソースのズレがバリューを生む</h3>
          <div className="overflow-x-auto">
            <BlockMath
              math="\text{回収率} = 0.75 \times \frac{\hat{P}^{\text{ours}}_{ijk}}{\hat{P}^{\text{market}}_{ijk}}"
              style={longMathStyle}
            />
          </div>
          <p className="text-slate-600">
            単勝オッズは「1着確率」を反映し、複勝オッズは「3着以内確率」を反映しています。
            この2つの市場が同じ馬を異なる尺度で評価しているため、
            <InlineMath math="\hat{P}^{\text{ours}}_{ijk} \neq \hat{P}^{\text{market}}_{ijk}" /> となり、
            回収率が75%から変動します。
          </p>
        </div>
      </section>

      {/* 安定度と2軸評価 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">安定度の意味と2軸評価</h2>

        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
          <h3 className="text-base font-medium text-slate-700">安定度 = 単勝オッズ ÷ 複勝オッズ中央値</h3>
          <p className="text-slate-600">
            安定度は、その馬の「1着確率に対する3着以内確率の比」を表しています。
          </p>
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            <li>
              <strong className="text-slate-800">安定度が高い馬</strong>（例: 3.0以上）：単勝で評価される能力に比べて、3着以内に来る能力が相対的に高い馬。
              「勝ち切れないが堅実に上位に来る」タイプで、3連複向きです。
            </li>
            <li>
              <strong className="text-slate-800">安定度が低い馬</strong>（例: 2.0以下）：1着か惨敗かの一発勝負タイプ。
              本命馬にありがちなパターンで、3連複では過大評価されやすい傾向があります。
            </li>
          </ul>
        </div>

        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
          <h3 className="text-base font-medium text-slate-700">なぜ回収率だけでなく2軸で判定するのか</h3>
          <p className="text-slate-600">
            回収率が高い組み合わせには2つのパターンがあります。
          </p>
          <ol className="list-decimal list-inside space-y-2 text-slate-600">
            <li>
              <strong className="text-slate-800">本当に割安な組み合わせ</strong>：的中確率も高く、かつ安定度も高い。
              複勝市場が示す「3着以内に来やすい」馬の組み合わせ。
            </li>
            <li>
              <strong className="text-slate-800">モデルの構造的な歪みで高く出ているだけの組み合わせ</strong>：穴馬ばかりの組み合わせなど、
              確率は極めて低いが比率の計算上だけ回収率が高く出るケース。
            </li>
          </ol>
          <p className="text-slate-600">
            2軸評価では、的中確率（複勝ベース）と安定度積の両方が中央値以上の組み合わせだけを「推奨」とすることで、
            パターン1の質の高い組み合わせを抽出しています。
          </p>
        </div>
      </section>

      {/* どのような組み合わせでズレが出るか */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">どのような組み合わせでズレが大きくなるか</h2>

        <div className="space-y-4 pl-4 border-l-2 border-slate-200">
          <div className="space-y-2">
            <h3 className="text-base font-medium text-emerald-700">安定度の高い馬の組合せ（バリューベット候補）</h3>
            <p className="text-slate-600">
              安定度の高い馬同士の組み合わせは、複勝ベースの確率が単勝ベースの市場評価を上回りやすく、
              回収率が高くなる傾向があります。
              「勝てないが3着には来る」タイプの馬が揃った組み合わせは、
              市場が過小評価しているバリューベットの候補です。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-medium text-rose-600">安定度の低い馬の組合せ（割高な買い目）</h3>
            <p className="text-slate-600">
              本命馬ばかりの組み合わせは、単勝ベースでは高確率に見えますが、
              複勝ベースではそれほど有利にならないことがあります。
              安定度の低い馬の組み合わせは、市場が過大評価している割高な買い目になりがちです。
            </p>
          </div>
        </div>
      </section>

      {/* 限界と注意点 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">このモデルの限界</h2>
        <ul className="list-disc list-inside space-y-3 text-slate-600">
          <li>
            <strong className="text-slate-800">回収率100%超が現実的とは限らない</strong>：回収率が100%を超える組み合わせは
            「このモデルの計算上は有利」というだけで、実際のレースで利益が保証されるわけではありません。
            あくまで2つの異なる市場データの比較に基づく相対評価です。
          </li>
          <li>
            <strong className="text-slate-800">市場モデルの仮定</strong>：実際の3連複市場が単純積モデルで価格形成されているという仮定に基づいています。
            実際の市場はより複雑な要因で動くため、この仮定は近似です。
          </li>
          <li>
            <strong className="text-slate-800">複勝オッズの範囲</strong>：複勝オッズは低〜高の範囲で提供され、中央値を使用しています。
            実際の結果はこの範囲内のどこかに落ち着くため、誤差が含まれます。
          </li>
          <li>
            <strong className="text-slate-800">データソースの同一性</strong>：単勝と複勝は異なる市場ですが、同じ出走馬・同じレースに対する
            ベッティング市場です。完全に独立した情報源ではないため、ズレの幅にも限界があります。
          </li>
          <li>
            <strong className="text-slate-800">レース展開の未考慮</strong>：逃げ・差し・追い込みなどの脚質、枠順、馬場状態などの
            レース固有の要因は考慮されていません。
          </li>
        </ul>
      </section>
    </article>
  )
}
