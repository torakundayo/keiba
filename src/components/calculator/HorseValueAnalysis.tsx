"use client"

import type { HorseValueStats } from '@/lib/calculator/types'

type HorseValueAnalysisProps = {
  horseStats: HorseValueStats[]
}

export function HorseValueAnalysis({ horseStats }: HorseValueAnalysisProps) {
  if (horseStats.length === 0) return null

  const hasPlaceOdds = horseStats.some(s => s.placeProbability > 0)

  return (
    <div className="space-y-4">
      <h3 className="text-base font-serif font-semibold text-slate-800">馬別分析</h3>
      {hasPlaceOdds ? (
        <p className="text-xs text-slate-400 leading-relaxed">
          複勝確率と安定度の2軸で各馬を評価。複勝確率=3着以内に来る確率、安定度=3連複向きの度合い。
        </p>
      ) : (
        <p className="text-xs text-slate-400 leading-relaxed">
          各馬が推奨組合せにどれだけ含まれているかを示します。
        </p>
      )}
      <div className="overflow-x-auto rounded-xl border border-slate-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="text-left p-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">馬番</th>
              <th className="text-left p-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">馬名</th>
              {hasPlaceOdds && (
                <>
                  <th className="text-right p-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">複勝確率</th>
                  <th className="text-right p-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">安定度</th>
                </>
              )}
              <th className="text-right p-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">推奨数</th>
              <th className="text-right p-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">全組合せ</th>
              <th className="text-right p-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">平均回収</th>
              <th className="text-right p-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">最高回収</th>
            </tr>
          </thead>
          <tbody>
            {horseStats.map((stat) => {
              const recRate = stat.totalCombinations > 0
                ? stat.recommendedCount / stat.totalCombinations
                : 0

              return (
                <tr
                  key={stat.horseNumber}
                  className={`border-b border-slate-50 transition-colors duration-150 ${
                    stat.recommendedCount === 0 ? 'opacity-40' : 'hover:bg-amber-50/20'
                  }`}
                >
                  <td className="p-3">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800 text-white text-xs font-bold tabular-nums">
                      {stat.horseNumber}
                    </span>
                  </td>
                  <td className="p-3 truncate max-w-[100px] text-slate-700">{stat.horseName || '-'}</td>
                  {hasPlaceOdds && (
                    <>
                      <td className="p-3 text-right tabular-nums">
                        <span className={`font-bold ${
                          stat.placeProbability > 0.5 ? 'text-emerald-600' :
                          stat.placeProbability > 0.3 ? 'text-sky-600' :
                          'text-slate-400'
                        }`}>
                          {(stat.placeProbability * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="p-3 text-right tabular-nums">
                        <span className={`font-bold ${
                          stat.stability > 3 ? 'text-emerald-600' :
                          stat.stability > 2 ? 'text-sky-600' :
                          'text-slate-400'
                        }`}>
                          {stat.stability.toFixed(1)}x
                        </span>
                      </td>
                    </>
                  )}
                  <td className="p-3 text-right tabular-nums">
                    <span className={`font-bold ${stat.recommendedCount > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {stat.recommendedCount}
                    </span>
                    <span className="text-slate-400 text-xs ml-1">
                      ({(recRate * 100).toFixed(0)}%)
                    </span>
                  </td>
                  <td className="p-3 text-right text-slate-500 tabular-nums">{stat.totalCombinations}</td>
                  <td className={`p-3 text-right font-medium tabular-nums ${
                    stat.averageEV >= 1.0 ? 'text-emerald-600' : 'text-rose-500'
                  }`}>
                    {Math.round(stat.averageEV * 100)}%
                  </td>
                  <td className={`p-3 text-right font-medium tabular-nums ${
                    stat.bestEV >= 1.0 ? 'text-emerald-600' : 'text-rose-500'
                  }`}>
                    {Math.round(stat.bestEV * 100)}%
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
