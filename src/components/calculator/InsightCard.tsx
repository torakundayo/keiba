"use client"

import dynamic from 'next/dynamic'
import Link from 'next/link'

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
          バックテストの結果と、このモデルの理論的背景について
        </p>
      </header>

      {/* バックテスト結果の要約 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">バックテストの結果</h2>
        <p className="text-sm text-slate-600">
          774レース（2025/11〜2026/02）のバックテストで、確率モデルの性能を検証しました。
        </p>

        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
          <h3 className="text-sm font-medium text-slate-700">確率ランキングは有効</h3>
          <p className="text-sm text-slate-600">
            的中した組み合わせの確率順位の中央値は16位（平均445通り中）。
            ランダムに選んだ場合の中央値は223位になるため、モデルは<strong className="text-slate-800">ランダムの約14倍の精度</strong>で的中組合せを上位にランク付けしています。
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
            <li>Top 1: 的中率 8.4%（ランダムの38倍）</li>
            <li>Top 3: 的中率 21.3%（ランダムの32倍）</li>
            <li>Top 5: 的中率 28.6%（ランダムの26倍）</li>
            <li>Top 10: 的中率 39.1%（ランダムの18倍）</li>
          </ul>
        </div>

        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
          <h3 className="text-sm font-medium text-slate-700">利益は出ない</h3>
          <p className="text-sm text-slate-600">
            しかし、最も回収率の高いTop 1戦略でも回収率は47%でした。
            確率順位は有効でも、<strong className="text-slate-800">利益を出すことはできません</strong>。
            これは市場効率仮説で説明できます。
          </p>
        </div>
      </section>

      {/* 市場効率仮説 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">なぜ利益が出ないのか: 市場効率仮説</h2>

        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
          <h3 className="text-sm font-medium text-slate-700">オッズに全ての情報が織り込まれている</h3>
          <p className="text-sm text-slate-600">
            競馬のオッズは、過去成績・血統・調教タイム・天候・馬場状態・騎手の力量など、
            あらゆる公開情報を市場参加者が織り込んだ結果です。
            このモデルはそのオッズから確率を推定しているため、
            <strong className="text-slate-800">オッズにすでに含まれている情報以上の知見を得ることができません</strong>。
          </p>
        </div>

        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
          <h3 className="text-sm font-medium text-slate-700">構造的な75%の壁</h3>
          <p className="text-sm text-slate-600">
            JRAの3連複控除率は25%（払戻率75%）。全組み合わせを均等に購入した場合、
            回収率は確実に75%になります。
            オッズから導出したモデルでは、どのような重み付けをしても、
            加重平均の回収率はこの75%に収束します。
          </p>
          <div className="overflow-x-auto">
            <BlockMath
              math="\text{加重平均回収率} = \frac{\sum (P^{\text{ours}}_{ijk} \times O_{ijk} \times 100)}{\sum 100} \approx 75\%"
              style={longMathStyle}
            />
          </div>
        </div>
      </section>

      {/* なぜ単一モデルだと75%に固定されるか */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">なぜ単一モデルでは回収率が75%に固定されるのか</h2>
        <p className="text-sm text-slate-600">
          もし確率とオッズを同じモデルから導出すると、回収率は必ず75%（3連複の払戻率）に固定されます。
          これは数学的なトートロジー（同語反復）です。
        </p>

        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
          <div className="overflow-x-auto">
            <BlockMath
              math="\text{回収率} = \frac{\sum (S_{ijk} \times \frac{0.75}{P_{ijk}} \times P_{ijk})}{\sum S_{ijk}} = \frac{0.75 \times \sum S_{ijk}}{\sum S_{ijk}} = 0.75"
              style={longMathStyle}
            />
          </div>
          <p className="text-sm text-slate-600">
            分子と分母の <InlineMath math="P_{ijk}" /> が完全に相殺されるため、
            どのような重み配分をしても回収率は変わりません。
            このため、本ツールでは単勝オッズと複勝オッズの2つの異なるデータソースを使っています。
          </p>
        </div>
      </section>

      {/* 2データソースアプローチ */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">単勝 × 複勝の2データソースアプローチ</h2>
        <p className="text-sm text-slate-600">
          <strong className="text-slate-800">単勝オッズ</strong>（市場モデル）と<strong className="text-slate-800">複勝オッズ</strong>（確率モデル）という
          異なるデータソースを使うことで、75%の壁からのズレを生み出しています。
        </p>

        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
          <div className="overflow-x-auto">
            <BlockMath
              math="\text{回収率} = 0.75 \times \frac{\hat{P}^{\text{ours}}_{ijk}}{\hat{P}^{\text{market}}_{ijk}}"
              style={longMathStyle}
            />
          </div>
          <p className="text-sm text-slate-600">
            単勝は「1着確率」を、複勝は「3着以内確率」を反映しています。
            この2つの市場の評価のズレにより、個別の組み合わせの回収率は75%から変動します。
            ただし、加重平均としては依然として75%前後に収束するため、全体で利益を出すことはできません。
          </p>
        </div>
      </section>

      {/* 想定される反論 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">「それでも勝てる方法があるのでは？」</h2>
        <p className="text-sm text-slate-600">
          75%の壁を超える方法について、よく挙げられる反論とその回答をまとめます。
        </p>

        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
          <h3 className="text-sm font-medium text-slate-700">「AI・機械学習を使えば勝てるのでは？」</h3>
          <p className="text-sm text-slate-600">
            機械学習モデルが使う特徴量（過去成績、血統、調教タイムなど）は、
            すべて<strong className="text-slate-800">他の市場参加者もアクセスできる公開情報</strong>です。
            これらの情報はすでにオッズに織り込まれています。
          </p>
          <p className="text-sm text-slate-600">
            仮にAIが市場より正確な確率を推定できたとしても、
            同じ手法を使う参加者が増えればオッズが修正され、優位性は消滅します。
            これは株式市場のアルゴリズム取引と同じメカニズムです。
          </p>
        </div>

        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
          <h3 className="text-sm font-medium text-slate-700">「オッズの変動タイミングを利用すれば？」</h3>
          <p className="text-sm text-slate-600">
            締め切り直前のオッズ変動を利用する戦略は理論的に存在しますが、
            JRAの投票締め切りは発走直前であり、大量の資金が最後に流入します。
            最終オッズは締め切り前のオッズと大きく異なることが多く、
            「変動を先読み」すること自体が困難です。
          </p>
          <p className="text-sm text-slate-600">
            また、仮にタイミング戦略が有効だとしても、
            それは「オッズに織り込まれていない情報」ではなく
            「まだ織り込まれていないだけの情報」であり、
            最終オッズでは反映されます。
          </p>
        </div>

        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
          <h3 className="text-sm font-medium text-slate-700">「プロの予想家は勝っているのでは？」</h3>
          <p className="text-sm text-slate-600">
            長期間の回収率データを公開している予想家は少なく、
            公開している場合も<strong className="text-slate-800">生存者バイアス</strong>が存在します。
            100人が予想を始めれば、統計的に数人は短期的に高い回収率を出しますが、
            それは実力ではなく確率的な偏りです。
          </p>
          <p className="text-sm text-slate-600">
            長期（1,000レース以上）で控除率25%を上回り続ける予想家の存在は、
            学術的には確認されていません。
          </p>
        </div>

        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
          <h3 className="text-sm font-medium text-slate-700">「非公開情報（インサイダー）があれば？」</h3>
          <p className="text-sm text-slate-600">
            馬の体調不良、調教の手応え、厩舎の勝負気配など、
            公開されていない情報を持つ関係者は理論的に優位性を持ちえます。
            しかし、これは<strong className="text-slate-800">合法性の問題</strong>であり、
            競馬法で規制されている領域です。
          </p>
          <p className="text-sm text-slate-600">
            また、関係者の購入行動はオッズに反映されるため、
            「不自然な人気の変動」として市場に情報が漏洩します。
            結果として、非公開情報の優位性も限定的です。
          </p>
        </div>
      </section>

      {/* 他のギャンブルとの比較 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">他のギャンブルとの比較</h2>
        <p className="text-sm text-slate-600">
          競馬の3連複（控除率25%）は、ギャンブル全体の中でどのような位置づけなのかを比較します。
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-slate-600">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-400">
                <th className="text-left py-2 pr-4">ギャンブル</th>
                <th className="text-right py-2 px-4">控除率</th>
                <th className="text-right py-2 px-4">払戻率</th>
                <th className="text-left py-2 pl-4">特徴</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-50">
                <td className="py-2 pr-4 font-medium text-slate-700">宝くじ</td>
                <td className="text-right py-2 px-4 tabular-nums">約55%</td>
                <td className="text-right py-2 px-4 tabular-nums text-rose-600 font-medium">約45%</td>
                <td className="py-2 pl-4 text-xs">最も不利。1枚300円の期待値は約135円</td>
              </tr>
              <tr className="border-b border-slate-50">
                <td className="py-2 pr-4 font-medium text-slate-700">競馬（3連複）</td>
                <td className="text-right py-2 px-4 tabular-nums">25%</td>
                <td className="text-right py-2 px-4 tabular-nums text-amber-600 font-medium">75%</td>
                <td className="py-2 pl-4 text-xs">100円あたりの期待値は75円</td>
              </tr>
              <tr className="border-b border-slate-50">
                <td className="py-2 pr-4 font-medium text-slate-700">パチンコ</td>
                <td className="text-right py-2 px-4 tabular-nums">10〜15%</td>
                <td className="text-right py-2 px-4 tabular-nums text-slate-600 font-medium">85〜90%</td>
                <td className="py-2 pl-4 text-xs">店舗設定により変動。長時間拘束</td>
              </tr>
              <tr className="border-b border-slate-50">
                <td className="py-2 pr-4 font-medium text-slate-700">カジノ（ルーレット）</td>
                <td className="text-right py-2 px-4 tabular-nums">2.7〜5.3%</td>
                <td className="text-right py-2 px-4 tabular-nums text-slate-600 font-medium">94.7〜97.3%</td>
                <td className="py-2 pl-4 text-xs">シングルゼロ/ダブルゼロで異なる</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-medium text-slate-700">カジノ（ブラックジャック）</td>
                <td className="text-right py-2 px-4 tabular-nums">0.5〜2%</td>
                <td className="text-right py-2 px-4 tabular-nums text-emerald-600 font-medium">98〜99.5%</td>
                <td className="py-2 pl-4 text-xs">基本戦略使用時。最も有利なギャンブル</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
          <p className="text-sm text-slate-600">
            競馬の控除率25%は宝くじ（55%）よりは有利ですが、
            カジノ（0.5〜5%）と比較するとかなり不利です。
            100回賭けた場合の期待損失で比較すると:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
            <li>宝くじ: 100回 × 300円 × 55% = <strong className="text-slate-800">16,500円の損失</strong></li>
            <li>競馬3連複: 100回 × 100円 × 25% = <strong className="text-slate-800">2,500円の損失</strong></li>
            <li>ブラックジャック: 100回 × 1,000円 × 1% = <strong className="text-slate-800">1,000円の損失</strong></li>
          </ul>
          <p className="text-sm text-slate-600">
            どのギャンブルも長期的には必ず損失が発生します。
            違いは<strong className="text-slate-800">損失の速度</strong>だけです。
          </p>
        </div>
      </section>

      {/* よくある非効率な買い方 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">よくある非効率な買い方</h2>
        <p className="text-sm text-slate-600">
          多くの競馬ファンが無意識にやっている買い方の中に、数学的に損失を拡大するパターンがあります。
          バックテストの結果から、以下の行動が非効率であることが示されています。
        </p>

        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
          <h3 className="text-sm font-medium text-slate-700">「絞れないからボックスで広げる」</h3>
          <p className="text-sm text-slate-600">
            5頭ボックス（10通り）や6頭ボックス（20通り）は、的中率が上がる代わりに
            <strong className="text-slate-800">回収率を確実に下げます</strong>。
            バックテストでは、購入点数を増やすほど回収率は単調に低下しました。
          </p>
          <div className="overflow-x-auto">
            <table className="text-sm text-slate-600 w-full">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-400">
                  <th className="text-left py-1.5 pr-4">買い方</th>
                  <th className="text-right py-1.5 px-4">点数</th>
                  <th className="text-right py-1.5 px-4">的中率</th>
                  <th className="text-right py-1.5 pl-4">回収率</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-50">
                  <td className="py-1.5 pr-4">Top 3（最少の絞り込み）</td>
                  <td className="text-right py-1.5 px-4 tabular-nums">3</td>
                  <td className="text-right py-1.5 px-4 tabular-nums">21.3%</td>
                  <td className="text-right py-1.5 pl-4 tabular-nums font-medium">45%</td>
                </tr>
                <tr className="border-b border-slate-50">
                  <td className="py-1.5 pr-4">5頭ボックス相当</td>
                  <td className="text-right py-1.5 px-4 tabular-nums">10</td>
                  <td className="text-right py-1.5 px-4 tabular-nums">39.1%</td>
                  <td className="text-right py-1.5 pl-4 tabular-nums font-medium">33%</td>
                </tr>
                <tr>
                  <td className="py-1.5 pr-4">6頭ボックス相当</td>
                  <td className="text-right py-1.5 px-4 tabular-nums">20</td>
                  <td className="text-right py-1.5 px-4 tabular-nums">56.1%</td>
                  <td className="text-right py-1.5 pl-4 tabular-nums font-medium">31%</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-sm text-slate-600">
            的中率は3倍近くに上がっていますが、回収率は45%から31%に低下しています。
            「絞れないから広げる」は<strong className="text-slate-800">損失を拡大する行為</strong>です。
            しかも実際のボックスは確率順位を無視した全組み合わせなので、
            確率上位のTop Nよりさらに回収率が悪くなります。
          </p>
        </div>

        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
          <h3 className="text-sm font-medium text-slate-700">「的中率を上げれば勝てる」という誤解</h3>
          <p className="text-sm text-slate-600">
            的中率と回収率は別の指標です。
            的中率を上げるために点数を増やすと、投資額が増える一方で、
            追加した組み合わせは確率が低い（=当たりにくい）ものです。
            結果として<strong className="text-slate-800">1レースあたりの損失額が増えます</strong>。
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-slate-600">
            <li>Top 3: 1レースあたり300円投資 → 平均165円の損失</li>
            <li>Top 10: 1レースあたり1,000円投資 → 平均670円の損失</li>
            <li>Top 20: 1レースあたり2,000円投資 → 平均1,380円の損失</li>
          </ul>
          <p className="text-sm text-slate-600">
            たまに当たる喜びは増えますが、トータルの損失も増えていきます。
          </p>
        </div>

        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
          <h3 className="text-sm font-medium text-slate-700">「人気馬同士のボックスなら堅い」</h3>
          <p className="text-sm text-slate-600">
            人気馬同士の組み合わせは的中確率が高い反面、<strong className="text-slate-800">オッズが低い</strong>ため、
            当たっても配当が投資額に見合いません。
            例えば5頭ボックス（10通り=1,000円）で的中しても、
            人気馬同士の3連複は配当が1,000〜3,000円程度のことが多く、
            外れた分の損失を取り戻せません。
          </p>
        </div>

        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
          <h3 className="text-sm font-medium text-slate-700">「大穴を狙えば一発で取り戻せる」</h3>
          <p className="text-sm text-slate-600">
            高配当の組み合わせは的中確率が極めて低いため、
            <strong className="text-slate-800">当たるまでの累積損失が配当を上回る</strong>のが通常です。
            バックテストでは、的中した組み合わせの75%が確率順位47位以内でした。
            確率的に下位の大穴は的中してもそれまでの損失に見合いません。
          </p>
        </div>
      </section>

      {/* ギャンブルの認知バイアス */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">ギャンブルの認知バイアス</h2>
        <p className="text-sm text-slate-600">
          人間の脳はギャンブルにおいて合理的な判断を下すことが苦手です。
          以下の認知バイアスを知っておくことで、非合理な行動を避ける助けになります。
        </p>

        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
          <h3 className="text-sm font-medium text-slate-700">損失回避バイアス</h3>
          <p className="text-sm text-slate-600">
            人は同じ金額の「利益」と「損失」を同等に感じません。
            1,000円を失う苦痛は、1,000円を得る喜びの<strong className="text-slate-800">約2倍</strong>の強さがあります（プロスペクト理論）。
            このため、損失を取り戻そうとして賭け金を増やす行動（いわゆる「追い上げ」）に陥りやすくなります。
          </p>
          <p className="text-sm text-slate-600">
            追い上げは「負けるほど賭け金が増える」構造であり、
            控除率25%の環境では損失を加速させるだけです。
          </p>
        </div>

        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
          <h3 className="text-sm font-medium text-slate-700">ニアミス効果</h3>
          <p className="text-sm text-slate-600">
            「あと1頭で的中だった」という体験は、実際には完全に外れた場合と結果（損失額）は同じですが、
            脳は<strong className="text-slate-800">「惜しかった＝次は当たりそう」</strong>と誤解釈します。
            3連複では「2頭は当たっていた」というニアミスが頻繁に発生し、
            これが購入を継続する動機づけになります。
          </p>
        </div>

        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
          <h3 className="text-sm font-medium text-slate-700">サンクコストの誤謬</h3>
          <p className="text-sm text-slate-600">
            「ここまで使ったお金を回収したい」という心理は、
            過去の投資（すでに失ったお金）に基づいて将来の判断を歪めます。
            過去の損失は<strong className="text-slate-800">取り戻せないコスト（埋没費用）</strong>であり、
            次のレースの期待値とは無関係です。
            次のレースの期待回収率は、常に75%前後です。
          </p>
        </div>

        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
          <h3 className="text-sm font-medium text-slate-700">ギャンブラーの誤謬</h3>
          <p className="text-sm text-slate-600">
            「5レース連続で外れたから、次は当たるはず」という考えは誤りです。
            各レースは<strong className="text-slate-800">独立事象</strong>であり、
            過去の結果が次のレースの的中確率に影響を与えることはありません。
            コイントスで5回連続表が出ても、次に表が出る確率は50%のままです。
          </p>
        </div>

        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
          <h3 className="text-sm font-medium text-slate-700">確証バイアス</h3>
          <p className="text-sm text-slate-600">
            的中した体験は鮮明に記憶され、外れた体験は忘れやすい傾向があります。
            「あの予想法でよく当たる」と感じていても、
            <strong className="text-slate-800">実際に全レースの収支を記録する</strong>と、
            多くの場合、期待回収率の75%前後に収束します。
          </p>
        </div>
      </section>

      {/* このツールの使い方 */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-800">このツールの最適な使い方</h2>
        <ul className="list-disc list-inside space-y-3 text-sm text-slate-600">
          <li>
            <strong className="text-slate-800">確率構造の可視化として使う</strong>:
            どの組み合わせが相対的に有利かを確認し、自分の予想と照らし合わせる材料にします。
          </li>
          <li>
            <strong className="text-slate-800">購入点数を絞る</strong>:
            バックテストの結果、少数精鋭（3〜5点）が最も回収率が高い戦略です。
            点数を増やすほど的中率は上がりますが、損失率も大きくなります。
          </li>
          <li>
            <strong className="text-slate-800">過信しない</strong>:
            このモデルはオッズの構造を可視化しているだけであり、
            利益を保証するものではありません。購入は自己責任で行ってください。
          </li>
          <li>
            <strong className="text-slate-800">自分の情報と組み合わせる</strong>:
            このモデルにない情報（馬場読み、パドック観察、レース展開予想など）を
            加味することで、モデル以上の判断が可能になる場合があります。
          </li>
          <li>
            <strong className="text-slate-800">損失の上限を決める</strong>:
            1日の投資額、1ヶ月の投資額に上限を設け、
            それを超えたら購入をやめるルールを事前に決めておくことが重要です。
          </li>
        </ul>
      </section>

      {/* Page Navigation */}
      <nav className="border-t border-slate-200 pt-6">
        <p className="text-xs text-slate-400 mb-3">関連ページ</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/explanation"
            className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors group"
          >
            <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900">計算方法</p>
            <p className="text-xs text-slate-400 mt-0.5">確率モデルの数学的根拠</p>
          </Link>
          <Link
            href="/backtest"
            className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors group"
          >
            <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900">検証</p>
            <p className="text-xs text-slate-400 mt-0.5">774レースの実証データ</p>
          </Link>
          <Link
            href="/analysis"
            className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors group"
          >
            <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900">買い目分析</p>
            <p className="text-xs text-slate-400 mt-0.5">実際のレースで試す</p>
          </Link>
        </div>
      </nav>
    </article>
  )
}
