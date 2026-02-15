"use client"

import { useState, useEffect, useMemo } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

// ===================== Types =====================

type TopNStrategy = {
  n: number
  costPerRace: number
  probHits: number
  probHitRate: number
  probTotalPayout: number
  probROI: number
  probAvgPayoutPerHit: number
}

type RankDistribution = {
  min: number
  p25: number
  median: number
  p75: number
  max: number
}

type BacktestTopNData = {
  totalRaces: number
  dateRange: { from: string; to: string }
  generatedAt: string
  avgTotalCombinations: number
  winComboRankDistribution: {
    byProb: RankDistribution
  }
  topNStrategies: TopNStrategy[]
}

// ===================== Chart Component =====================

function ReturnRateChart({ strategies }: { strategies: TopNStrategy[] }) {
  const data = strategies.map(s => ({
    n: s.n,
    returnRate: (1 + s.probROI) * 100,
    hitRate: s.probHitRate * 100,
  }))

  const width = 560
  const height = 280
  const pad = { top: 20, right: 60, bottom: 45, left: 50 }
  const chartW = width - pad.left - pad.right
  const chartH = height - pad.top - pad.bottom

  const maxN = Math.max(...data.map(d => d.n))
  const maxY = Math.max(...data.map(d => Math.max(d.returnRate, d.hitRate)))

  const xScale = (n: number) => pad.left + (n / maxN) * chartW
  const yScale = (v: number) => pad.top + chartH - (v / maxY) * chartH

  const returnPath = data.map((d, i) =>
    `${i === 0 ? 'M' : 'L'} ${xScale(d.n).toFixed(1)} ${yScale(d.returnRate).toFixed(1)}`
  ).join(' ')

  const hitPath = data.map((d, i) =>
    `${i === 0 ? 'M' : 'L'} ${xScale(d.n).toFixed(1)} ${yScale(d.hitRate).toFixed(1)}`
  ).join(' ')

  // Y-axis ticks
  const yTicks = [0, 10, 20, 30, 40, 50, 60].filter(v => v <= maxY + 5)

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[560px]">
        {/* Grid lines */}
        {yTicks.map(v => (
          <g key={v}>
            <line
              x1={pad.left} y1={yScale(v)}
              x2={width - pad.right} y2={yScale(v)}
              stroke="#e2e8f0" strokeWidth={1}
            />
            <text x={pad.left - 8} y={yScale(v) + 4} textAnchor="end"
              className="text-[11px] fill-slate-400 tabular-nums">
              {v}%
            </text>
          </g>
        ))}

        {/* X-axis */}
        {data.map(d => (
          <text key={d.n} x={xScale(d.n)} y={height - pad.bottom + 18}
            textAnchor="middle" className="text-[11px] fill-slate-400 tabular-nums">
            {d.n}
          </text>
        ))}
        <text x={pad.left + chartW / 2} y={height - 4}
          textAnchor="middle" className="text-[11px] fill-slate-500">
          購入点数 N
        </text>

        {/* Return rate line */}
        <path d={returnPath} fill="none" stroke="#334155" strokeWidth={2} />
        {data.map(d => (
          <circle key={`r-${d.n}`} cx={xScale(d.n)} cy={yScale(d.returnRate)}
            r={3.5} fill="#334155" />
        ))}

        {/* Hit rate line */}
        <path d={hitPath} fill="none" stroke="#94a3b8" strokeWidth={2} strokeDasharray="6,4" />
        {data.map(d => (
          <circle key={`h-${d.n}`} cx={xScale(d.n)} cy={yScale(d.hitRate)}
            r={3} fill="#94a3b8" />
        ))}

        {/* Labels on right side */}
        <text x={width - pad.right + 8} y={yScale(data[data.length - 1].returnRate) + 4}
          className="text-[10px] fill-slate-700 font-medium">
          回収率
        </text>
        <text x={width - pad.right + 8} y={yScale(data[data.length - 1].hitRate) + 4}
          className="text-[10px] fill-slate-400">
          的中率
        </text>

        {/* Data labels for return rate */}
        {data.map(d => (
          <text key={`rl-${d.n}`} x={xScale(d.n)} y={yScale(d.returnRate) - 10}
            textAnchor="middle" className="text-[10px] fill-slate-600 font-medium tabular-nums">
            {d.returnRate.toFixed(0)}%
          </text>
        ))}
      </svg>
    </div>
  )
}

// ===================== Strategy Table =====================

function TopNTable({ strategies, totalRaces }: { strategies: TopNStrategy[]; totalRaces: number }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left p-2.5 text-xs text-slate-400">買い方</th>
            <th className="text-right p-2.5 text-xs text-slate-400">投資/R</th>
            <th className="text-right p-2.5 text-xs text-slate-400">的中</th>
            <th className="text-right p-2.5 text-xs text-slate-400">的中率</th>
            <th className="text-right p-2.5 text-xs text-slate-400">平均配当</th>
            <th className="text-right p-2.5 text-xs text-slate-400">回収率</th>
          </tr>
        </thead>
        <tbody>
          {strategies.map(s => {
            const returnRate = (1 + s.probROI) * 100
            return (
              <tr key={s.n} className="border-b border-slate-50 hover:bg-slate-50">
                <td className="p-2.5 font-medium text-slate-700">Top {s.n}</td>
                <td className="text-right p-2.5 tabular-nums text-slate-600">
                  {s.costPerRace.toLocaleString()}円
                </td>
                <td className="text-right p-2.5 tabular-nums text-slate-600">
                  {s.probHits}/{totalRaces}
                </td>
                <td className="text-right p-2.5 tabular-nums text-slate-700 font-medium">
                  {(s.probHitRate * 100).toFixed(1)}%
                </td>
                <td className="text-right p-2.5 tabular-nums text-slate-600">
                  {Math.round(s.probAvgPayoutPerHit).toLocaleString()}円
                </td>
                <td className={`text-right p-2.5 tabular-nums font-bold ${
                  returnRate >= 100 ? 'text-emerald-700' : 'text-rose-600'
                }`}>
                  {returnRate.toFixed(1)}%
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ===================== Rank Distribution =====================

function RankDistributionView({ dist, avgTotal }: { dist: RankDistribution; avgTotal: number }) {
  const items = [
    { label: '最上位', value: dist.min, desc: '最も高い順位で的中した例' },
    { label: '25%点', value: dist.p25, desc: '上位25%の的中がこの順位以内' },
    { label: '中央値', value: dist.median, desc: '的中組合せの典型的な順位' },
    { label: '75%点', value: dist.p75, desc: '上位75%の的中がこの順位以内' },
    { label: '最下位', value: dist.max, desc: '最も低い順位で的中した例' },
  ]

  return (
    <div className="space-y-3">
      {items.map(item => {
        const pct = avgTotal > 0 ? (item.value / avgTotal) * 100 : 0
        const barWidth = avgTotal > 0 ? Math.min((item.value / avgTotal) * 100, 100) : 0
        return (
          <div key={item.label} className="flex items-center gap-3">
            <span className="w-16 text-xs text-slate-500 text-right shrink-0">{item.label}</span>
            <div className="flex-1 h-5 bg-slate-50 rounded overflow-hidden">
              <div
                className="h-full bg-slate-300 rounded"
                style={{ width: `${barWidth}%` }}
              />
            </div>
            <span className="text-sm tabular-nums text-slate-700 w-28 text-right shrink-0">
              {item.value}位
              <span className="text-xs text-slate-400 ml-1">({pct.toFixed(1)}%)</span>
            </span>
          </div>
        )
      })}
      <p className="text-xs text-slate-400">
        平均 {Math.round(avgTotal)} 通り中の順位。パーセンテージは全組合せ中の位置。
      </p>
    </div>
  )
}

// ===================== Main Page =====================

export default function BacktestPage() {
  const [data, setData] = useState<BacktestTopNData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDetail, setShowDetail] = useState(false)

  useEffect(() => {
    fetch('/data/backtest-topn-results.json')
      .then(res => {
        if (!res.ok) throw new Error('バックテストデータが見つかりません')
        return res.json()
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  // Compute per-race expected return for the N vs return chart
  const chartStrategies = useMemo(() => {
    if (!data) return []
    return data.topNStrategies
  }, [data])

  return (
    <div className="min-h-screen px-4 py-8 md:px-12 md:py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-xl font-bold text-slate-800">バックテスト</h1>
          <p className="mt-1 text-sm text-slate-500">
            確率順Top-N購入戦略の実績検証
          </p>
        </div>

        {loading && (
          <div className="py-12 text-center text-sm text-slate-400">
            データを読み込み中...
          </div>
        )}

        {error && (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-500">{error}</p>
            <p className="mt-2 text-xs text-slate-400">
              npx tsx scripts/backtest-topn.ts を実行してデータを生成してください
            </p>
          </div>
        )}

        {data && (
          <>
            {/* Header stats */}
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 text-sm text-slate-500">
              <span>
                期間: {data.dateRange.from} 〜 {data.dateRange.to}
              </span>
              <span>{data.totalRaces}レース分析</span>
              <span className="text-xs text-slate-400">
                生成: {new Date(data.generatedAt).toLocaleDateString('ja-JP')}
              </span>
            </div>

            {/* Top-N Strategy Comparison */}
            <section>
              <h2 className="text-sm font-semibold text-slate-700 mb-3">
                Top-N戦略別パフォーマンス
              </h2>
              <TopNTable strategies={data.topNStrategies} totalRaces={data.totalRaces} />
              <div className="mt-4 text-xs text-slate-400 space-y-1">
                <p>
                  確率モデルの上位N通りを各100円で購入した場合の実績。
                  回収率 = 総回収額 / 総投資額 × 100。
                </p>
              </div>
            </section>

            {/* N vs Return Rate Chart */}
            <section>
              <h2 className="text-sm font-semibold text-slate-700 mb-3">
                購入点数と回収率・的中率の関係
              </h2>
              <p className="text-xs text-slate-500 mb-4">
                点数を増やすと的中率は上がるが、回収率は下がる。
                少数精鋭（Top 1〜3）が最も損失率が低い。
              </p>
              <ReturnRateChart strategies={chartStrategies} />
            </section>

            {/* Rank Distribution */}
            <section>
              <h2 className="text-sm font-semibold text-slate-700 mb-3">
                的中組合せの順位分布
              </h2>
              <p className="text-xs text-slate-500 mb-3">
                実際に的中した3連複の組み合わせが、確率モデルの何位にランクされていたか
              </p>
              <RankDistributionView
                dist={data.winComboRankDistribution.byProb}
                avgTotal={data.avgTotalCombinations}
              />
            </section>

            {/* Key Insights */}
            <section className="space-y-3 text-sm text-slate-600 border-t border-slate-200 pt-6">
              <h2 className="text-sm font-semibold text-slate-700">分析結果のまとめ</h2>
              <ul className="space-y-2 list-disc list-inside text-slate-500">
                <li>
                  <strong className="text-slate-700">確率モデルは有効</strong>:
                  的中組合せの中央順位は16位（上位3.6%）。ランダムなら中央値は{Math.round(data.avgTotalCombinations / 2)}位になるはず。
                </li>
                <li>
                  <strong className="text-slate-700">利益は出ない</strong>:
                  最も回収率の高いTop 1でも{((1 + data.topNStrategies[0].probROI) * 100).toFixed(0)}%。
                  市場効率により、オッズから導出したモデルで75%を超えることは構造的に困難。
                </li>
                <li>
                  <strong className="text-slate-700">最適戦略は少数精鋭</strong>:
                  回収率はTop 1が最高で、点数を増やすほど低下。
                  損失を最小化するには、上位3〜5通りに絞るのが合理的。
                </li>
              </ul>
            </section>

            {/* Expandable detail section */}
            <section>
              <button
                onClick={() => setShowDetail(!showDetail)}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                {showDetail ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                詳細データ
              </button>

              {showDetail && (
                <div className="mt-4 space-y-4 text-xs text-slate-500">
                  <div>
                    <p className="font-medium text-slate-600 mb-1">市場効率仮説（EMH）</p>
                    <p>
                      競馬のオッズは全ての公開情報（過去成績、血統、調教タイム、天候、馬場状態など）を
                      すでに織り込んでいます。このモデルはオッズから確率を推定しているため、
                      オッズに含まれる情報以上の知見を得ることができず、
                      JRAの控除率25%を上回る回収率を達成することは原理的に困難です。
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-slate-600 mb-1">モデルの価値</p>
                    <p>
                      利益は出せないものの、確率の順位付けは有効です（ランダムの26〜38倍の精度）。
                      このツールの価値は「どの組み合わせが相対的に有利か」を可視化し、
                      購入点数と損失のトレードオフを理解した上で意思決定できることにあります。
                    </p>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
