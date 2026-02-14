"use client"

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

// ===================== Types =====================

type StrategyAggregate = {
  name: string
  tiers: string[]
  totalRaces: number
  totalCost: number
  totalPayout: number
  hits: number
  hitRate: number
  roi: number
  avgCombosPerRace: number
}

type RaceResult = {
  raceId: string
  raceName: string
  date: string
  venue: string
  raceNumber: number
  horseCount: number
  top3: number[]
  trifectaPayout: number
  trifectaCombo: number[]
  totalCombinations: number
  tierCounts: Record<string, number>
  winningComboTier: string | null
  strategies: {
    name: string
    tiers: string[]
    combos: number
    cost: number
    hit: boolean
    payout: number
  }[]
}

type BacktestData = {
  totalRaces: number
  dateRange: { from: string; to: string }
  generatedAt: string
  strategies: StrategyAggregate[]
  tierDistribution: Record<string, number>
  races: RaceResult[]
}

// ===================== Helpers =====================

const TIER_LABELS: Record<string, string> = {
  recommended: '推奨',
  promising: '有望',
  solid: '堅実',
  longshot: '穴狙い',
  avoid: '非推奨',
  unknown: '不明',
}

const TIER_CLASSES: Record<string, string> = {
  recommended: 'bg-emerald-100 text-emerald-700',
  promising: 'bg-teal-100 text-teal-700',
  solid: 'bg-sky-100 text-sky-700',
  longshot: 'bg-amber-100 text-amber-700',
  avoid: 'bg-slate-100 text-slate-500',
  unknown: 'bg-slate-100 text-slate-400',
}

function formatYen(value: number): string {
  if (Math.abs(value) >= 10000) {
    return `${(value / 10000).toFixed(1)}万`
  }
  return value.toLocaleString()
}

// ===================== Components =====================

function StrategyTable({ strategies }: { strategies: StrategyAggregate[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left p-2.5 text-xs text-slate-400">戦略</th>
            <th className="text-right p-2.5 text-xs text-slate-400">レース数</th>
            <th className="text-right p-2.5 text-xs text-slate-400">的中</th>
            <th className="text-right p-2.5 text-xs text-slate-400">的中率</th>
            <th className="text-right p-2.5 text-xs text-slate-400">平均点数</th>
            <th className="text-right p-2.5 text-xs text-slate-400">投資額</th>
            <th className="text-right p-2.5 text-xs text-slate-400">回収額</th>
            <th className="text-right p-2.5 text-xs text-slate-400">ROI</th>
          </tr>
        </thead>
        <tbody>
          {strategies.map(s => (
            <tr key={s.name} className="border-b border-slate-50 hover:bg-slate-50">
              <td className="p-2.5 font-medium text-slate-700">{s.name}</td>
              <td className="text-right p-2.5 tabular-nums text-slate-600">
                {s.totalRaces}
              </td>
              <td className="text-right p-2.5 tabular-nums text-slate-600">
                {s.hits}
              </td>
              <td className="text-right p-2.5 tabular-nums text-slate-700 font-medium">
                {(s.hitRate * 100).toFixed(1)}%
              </td>
              <td className="text-right p-2.5 tabular-nums text-slate-600">
                {s.avgCombosPerRace.toFixed(1)}
              </td>
              <td className="text-right p-2.5 tabular-nums text-slate-600">
                {formatYen(s.totalCost)}円
              </td>
              <td className="text-right p-2.5 tabular-nums text-slate-600">
                {formatYen(s.totalPayout)}円
              </td>
              <td className={`text-right p-2.5 tabular-nums font-bold ${
                s.roi >= 0 ? 'text-emerald-700' : 'text-rose-600'
              }`}>
                {s.roi >= 0 ? '+' : ''}{(s.roi * 100).toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TierDistribution({
  distribution,
  total,
}: {
  distribution: Record<string, number>
  total: number
}) {
  const tiers = ['recommended', 'promising', 'solid', 'longshot', 'avoid', 'unknown']
  const maxCount = Math.max(...Object.values(distribution))

  return (
    <div className="space-y-2">
      {tiers
        .filter(tier => (distribution[tier] || 0) > 0)
        .map(tier => {
          const count = distribution[tier] || 0
          const pct = total > 0 ? (count / total) * 100 : 0
          const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0
          return (
            <div key={tier} className="flex items-center gap-3">
              <span
                className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold w-14 text-center ${TIER_CLASSES[tier]}`}
              >
                {TIER_LABELS[tier]}
              </span>
              <div className="flex-1 h-5 bg-slate-50 rounded overflow-hidden">
                <div
                  className="h-full bg-slate-200 rounded"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
              <span className="text-sm tabular-nums text-slate-600 w-24 text-right">
                {count}レース ({pct.toFixed(1)}%)
              </span>
            </div>
          )
        })}
    </div>
  )
}

function RaceList({ races }: { races: RaceResult[] }) {
  const [expanded, setExpanded] = useState(false)
  const [filter, setFilter] = useState<string>('all')

  const filtered =
    filter === 'all'
      ? races
      : filter === 'hit'
        ? races.filter(r => r.strategies.some(s => s.hit))
        : races.filter(r => r.winningComboTier === filter)

  // Show most recent first
  const sorted = [...filtered].reverse()

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        個別レース結果（{races.length}件）
      </button>

      {expanded && (
        <div className="mt-3">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {[
              { key: 'all', label: '全て' },
              { key: 'hit', label: '的中のみ' },
              { key: 'recommended', label: '推奨' },
              { key: 'promising', label: '有望' },
              { key: 'solid', label: '堅実' },
              { key: 'longshot', label: '穴狙い' },
              { key: 'avoid', label: '非推奨' },
            ].map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                  filter === f.key
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left p-2 text-slate-400">日付</th>
                  <th className="text-left p-2 text-slate-400">レース</th>
                  <th className="text-right p-2 text-slate-400">頭数</th>
                  <th className="text-left p-2 text-slate-400">3連複</th>
                  <th className="text-right p-2 text-slate-400">配当</th>
                  <th className="text-left p-2 text-slate-400">ティア</th>
                  <th className="text-center p-2 text-slate-400">推奨</th>
                  <th className="text-center p-2 text-slate-400">推奨+有望</th>
                </tr>
              </thead>
              <tbody>
                {sorted.slice(0, 100).map(race => {
                  const s1 = race.strategies.find(s => s.name === '推奨のみ')
                  const s2 = race.strategies.find(s => s.name === '推奨＋有望')
                  return (
                    <tr
                      key={race.raceId}
                      className="border-b border-slate-50 hover:bg-slate-50"
                    >
                      <td className="p-2 text-slate-500 tabular-nums">
                        {race.date.slice(5)}
                      </td>
                      <td className="p-2 text-slate-700">
                        {race.venue}{race.raceNumber}R
                      </td>
                      <td className="text-right p-2 tabular-nums text-slate-500">
                        {race.horseCount}
                      </td>
                      <td className="p-2 tabular-nums text-slate-700">
                        {race.trifectaCombo.join('-')}
                      </td>
                      <td className="text-right p-2 tabular-nums text-slate-600">
                        {race.trifectaPayout.toLocaleString()}円
                      </td>
                      <td className="p-2">
                        {race.winningComboTier && (
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              TIER_CLASSES[race.winningComboTier]
                            }`}
                          >
                            {TIER_LABELS[race.winningComboTier]}
                          </span>
                        )}
                      </td>
                      <td className="text-center p-2">
                        {s1?.hit ? (
                          <span className="text-emerald-600 font-bold">○</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="text-center p-2">
                        {s2?.hit ? (
                          <span className="text-emerald-600 font-bold">○</span>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {sorted.length > 100 && (
              <p className="text-xs text-slate-400 mt-2 text-center">
                先頭100件を表示中（全{sorted.length}件）
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ===================== Main Page =====================

export default function BacktestPage() {
  const [data, setData] = useState<BacktestData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/backtest-results.json')
      .then(res => {
        if (!res.ok) throw new Error('バックテストデータが見つかりません')
        return res.json()
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen px-4 py-8 md:px-12 md:py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <h1 className="text-xl font-bold text-slate-800">バックテスト</h1>
          <p className="mt-1 text-sm text-slate-500">
            過去のレースデータを使い、モデルの予測精度と各戦略のROIを検証
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
              npx tsx scripts/backtest.ts を実行してデータを生成してください
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

            {/* Strategy comparison */}
            <section>
              <h2 className="text-sm font-semibold text-slate-700 mb-3">
                戦略別パフォーマンス
              </h2>
              <StrategyTable strategies={data.strategies} />

              <div className="mt-4 space-y-2 text-xs text-slate-400">
                <p>
                  各戦略は該当ティアの全組み合わせを1口100円で購入した場合の結果。
                  ROI = (回収額 - 投資額) / 投資額。
                </p>
              </div>
            </section>

            {/* Tier distribution */}
            <section>
              <h2 className="text-sm font-semibold text-slate-700 mb-3">
                的中組み合わせのティア分布
              </h2>
              <p className="text-xs text-slate-500 mb-3">
                実際に的中した3連複の組み合わせが、モデルのどのティアに分類されていたか
              </p>
              <TierDistribution
                distribution={data.tierDistribution}
                total={data.totalRaces}
              />
            </section>

            {/* Race details */}
            <section>
              <RaceList races={data.races} />
            </section>
          </>
        )}
      </div>
    </div>
  )
}
