import Link from 'next/link'
import { Calculator, BookOpen, Lightbulb, FlaskConical } from 'lucide-react'

const pages = [
  {
    href: '/analysis',
    icon: Calculator,
    title: '買い目分析',
    description: 'レースを選んで、確率上位の組み合わせを確認できます。購入点数ごとの的中率・回収率の比較も表示します。',
  },
  {
    href: '/explanation',
    icon: BookOpen,
    title: '計算方法',
    description: '単勝オッズと複勝オッズから3連複の的中確率と期待回収率を推定する数理モデルの詳細。',
  },
  {
    href: '/insight',
    icon: Lightbulb,
    title: '考察',
    description: 'なぜ利益が出ないのか、よくある非効率な買い方、このツールの最適な使い方について。',
  },
  {
    href: '/backtest',
    icon: FlaskConical,
    title: '検証',
    description: '774レースのバックテスト結果。確率モデルの予測精度とTop-N戦略の実績データ。',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen px-4 py-12 md:px-12 md:py-20">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
            3連複 確率構造分析
          </h1>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            単勝・複勝オッズから3連複の的中確率を推定し、
            どの組み合わせが相対的に有利かを可視化するツールです。
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mb-10 pl-4 border-l-2 border-slate-300">
          <p className="text-sm text-slate-600 leading-relaxed">
            <strong className="text-slate-800">このツールは利益を保証しません。</strong>
            競馬のオッズには全ての公開情報が織り込まれており、
            オッズから導出したモデルでJRAの控除率25%を上回ることは構造的に困難です。
            774レースのバックテストでも、最も回収率の高い戦略で47%でした。
          </p>
          <p className="text-sm text-slate-500 mt-2 leading-relaxed">
            このツールの価値は、確率の順位付けにあります。
            的中した組み合わせの75%は確率上位10%以内にランクされており、
            「どこに賭ければ最も損失が少ないか」の判断材料を提供します。
          </p>
        </div>

        {/* Page links */}
        <div className="space-y-3">
          {pages.map(({ href, icon: Icon, title, description }) => (
            <Link
              key={href}
              href={href}
              className="flex items-start gap-4 p-4 rounded-lg border border-slate-200 hover:border-slate-400 transition-colors group"
            >
              <div className="flex items-center justify-center w-9 h-9 rounded-md bg-slate-100 group-hover:bg-slate-200 transition-colors shrink-0 mt-0.5">
                <Icon className="h-4.5 w-4.5 text-slate-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800 group-hover:text-slate-900">
                  {title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  {description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Backtest summary */}
        <div className="mt-10 text-xs text-slate-400 space-y-1">
          <p>
            バックテスト: 774レース（2025/11〜2026/02）で検証。
            確率順位の中央値は16位（平均445通り中）、ランダム比26〜38倍の精度。
          </p>
          <p>
            購入は自己責任で行ってください。
          </p>
        </div>
      </div>
    </div>
  )
}
