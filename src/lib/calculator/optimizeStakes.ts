import { harvilleTrifecta } from './harville'
import { calculateResultsForStakes } from './calculateResults'
import type { CalculationResult } from './types'

/**
 * 最適重み配分の解析的求解
 *
 * EV = Σ(s_h × W_h) / (K × Σs_h) は線形分数関数。
 * 各馬の重みは境界値（最小 or 最大）が最適であることが証明できる。
 * W_h 降順にソートし、上位 k 頭に最大重み・残りに最小重みを割り当てる
 * n+1 通りの分割を試すだけで最適解が求まる。
 *
 * 計算量: O(C(n,3)) ← 旧アルゴリズムの O(10^n × C(n,3)) から劇的に改善
 */
export const optimizeStakes = async (
  validHorseIndices: number[],
  odds: number[],
  onProgress: (progress: number, bestValue: number) => void
): Promise<{
  optimalStakes: number[]
  optimalResults: CalculationResult
  maxExpectedValue: number
  allPatterns: { pattern: number[]; expectedValue: number; horses: number[] }[]
}> => {
  const n = validHorseIndices.length
  if (n < 3) throw new Error('3頭以上の馬を選択してください')

  const MIN_STAKE = 100
  const MAX_STAKE = 1000

  // 確率の正規化（単勝オッズから逆算）
  const includedOdds = validHorseIndices.map(i => odds[i])
  const p_raw = includedOdds.map(o => 0.8 / o)
  const sum_p_raw = p_raw.reduce((acc, v) => acc + v, 0)
  const p_norm = p_raw.map(v => v / sum_p_raw)

  // 各馬のバリュー寄与度 W_h を計算
  // W_h = Σ_{c∋h} (P_harville / P_naive)
  // 正規化前の比率で十分（全馬に同じ定数がかかるため、最適分割に影響しない）
  const W = new Float64Array(n)

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        const pNaive = p_norm[i] * p_norm[j] * p_norm[k]
        const pHarville = harvilleTrifecta(p_norm[i], p_norm[j], p_norm[k])
        const ratio = pHarville / pNaive
        W[i] += ratio
        W[j] += ratio
        W[k] += ratio
      }
    }
  }

  // W_h 降順でソートされた馬のインデックス
  const horseOrder = Array.from({ length: n }, (_, i) => i)
    .sort((a, b) => W[b] - W[a])

  // 最適分割を探索: 上位 k 頭に MAX_STAKE、残りに MIN_STAKE
  // EV ∝ (MIN_STAKE·ΣW + (MAX_STAKE-MIN_STAKE)·Σ_{top k} W) / (MIN_STAKE·n + (MAX_STAKE-MIN_STAKE)·k)
  const totalW = Array.from(W).reduce((s, v) => s + v, 0)
  const diff = MAX_STAKE - MIN_STAKE

  let maxEV = -Infinity
  let bestTopCount = 0
  let cumW = 0

  for (let topCount = 0; topCount <= n; topCount++) {
    if (topCount > 0) cumW += W[horseOrder[topCount - 1]]
    const numerator = MIN_STAKE * totalW + diff * cumW
    const denominator = MIN_STAKE * n + diff * topCount
    if (denominator === 0) continue
    const ev = numerator / denominator
    if (ev > maxEV) {
      maxEV = ev
      bestTopCount = topCount
    }
  }

  // 最適パターンの構築
  const optimalPattern = new Array(n).fill(MIN_STAKE)
  for (let i = 0; i < bestTopCount; i++) {
    optimalPattern[horseOrder[i]] = MAX_STAKE
  }

  const optimalStakes = Array(18).fill(0)
  validHorseIndices.forEach((horseIndex, i) => {
    optimalStakes[horseIndex] = optimalPattern[i]
  })

  const placeOddsArr = Array(18).fill(null).map(() => ({ low: 0, high: 0 }))
  const optimalResults = calculateResultsForStakes(optimalStakes, odds, placeOddsArr)
  if (!optimalResults) throw new Error('有効な組み合わせが見つかりませんでした')

  const actualEV = optimalResults.weightedReturn / optimalResults.totalStakes
  onProgress(1, actualEV)

  return {
    optimalStakes,
    optimalResults,
    maxExpectedValue: actualEV,
    allPatterns: [],
  }
}
