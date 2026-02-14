import { harvilleTrifecta } from './harville'
import type { CalculationResult, CombinationResult, HorseValueStats, PlaceOdds, RecommendationTier } from './types'

/**
 * 複勝オッズが利用可能かチェック
 */
function hasPlaceOdds(placeOdds: PlaceOdds[]): boolean {
  return placeOdds.some(p => p.low > 0 && p.high > 0)
}

/**
 * 複勝オッズ + 単勝オッズモデル（新モデル）
 *
 * 単勝オッズ → P(1着) の市場評価 → 3連複の市場オッズ推定に使用
 * 複勝オッズ → P(3着以内) の市場評価 → 3連複の確率推定に使用
 *
 * 安定度 = 単勝オッズ / 複勝オッズ中央値
 *   → 高いほど「勝ちきれないが3着には来やすい」馬（3連複向き）
 *
 * EV = 0.75 × P_place_model / P_win_model
 *   → 複勝ベースの確率が単勝ベースの市場評価より高い組合せ = バリュー
 */
function calculateWithPlaceOdds(
  includedIndices: number[],
  currentStakes: number[],
  winOdds: number[],
  placeOddsArr: PlaceOdds[],
  horseNames?: string[]
): CalculationResult | null {
  const n = includedIndices.length

  const STAKE_PER_COMBO = 100

  const pWin = new Float64Array(n)
  const pPlace = new Float64Array(n)
  const stability = new Float64Array(n)
  let sumPWin = 0
  let sumPPlace = 0

  for (let i = 0; i < n; i++) {
    const idx = includedIndices[i]
    pWin[i] = 1 / winOdds[idx]
    const placeMid = (placeOddsArr[idx].low + placeOddsArr[idx].high) / 2
    pPlace[i] = 1 / placeMid
    stability[i] = winOdds[idx] / placeMid
    sumPWin += pWin[i]
    sumPPlace += pPlace[i]
  }

  // 正規化
  for (let i = 0; i < n; i++) {
    pWin[i] /= sumPWin
    pPlace[i] /= sumPPlace
  }

  // 組み合わせ生成
  const comboCount = n * (n - 1) * (n - 2) / 6
  const winProbs = new Float64Array(comboCount)
  const placeProbs = new Float64Array(comboCount)
  const comboHorses: number[][] = new Array(comboCount)
  const comboLocalIndices: [number, number, number][] = new Array(comboCount)
  const comboStabilities = new Float64Array(comboCount)

  let idx = 0
  let totalWinProb = 0
  let totalPlaceProb = 0

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        winProbs[idx] = pWin[i] * pWin[j] * pWin[k]
        placeProbs[idx] = pPlace[i] * pPlace[j] * pPlace[k]
        comboHorses[idx] = [includedIndices[i] + 1, includedIndices[j] + 1, includedIndices[k] + 1]
        comboLocalIndices[idx] = [i, j, k]
        comboStabilities[idx] = stability[i] * stability[j] * stability[k]
        totalWinProb += winProbs[idx]
        totalPlaceProb += placeProbs[idx]
        idx++
      }
    }
  }

  // 正規化してEV計算（1買い目100円）
  const totalStakesAll = comboCount * STAKE_PER_COMBO
  let sumWeightedReturn = 0
  const combinationResults: CombinationResult[] = new Array(comboCount)
  const probabilities: number[] = new Array(comboCount)

  let bestEVValue = -Infinity
  let worstEVValue = Infinity
  let bestEVIdx = 0
  let worstEVIdx = 0
  let valueBetCount = 0

  for (let c = 0; c < comboCount; c++) {
    const P_market = winProbs[c] / totalWinProb
    const P_ours = placeProbs[c] / totalPlaceProb
    const marketOdds = 0.75 / P_market
    const comboReturn = STAKE_PER_COMBO * marketOdds
    const ev = 0.75 * P_ours / P_market

    probabilities[c] = P_ours

    combinationResults[c] = {
      horses: comboHorses[c],
      stake: STAKE_PER_COMBO,
      approximateOdds: marketOdds,
      expectedReturn: comboReturn,
      probability: P_ours,
      ev,
      tier: 'avoid',
      comboStability: comboStabilities[c],
    }

    sumWeightedReturn += comboReturn * P_ours

    if (ev > bestEVValue) { bestEVValue = ev; bestEVIdx = c }
    if (ev < worstEVValue) { worstEVValue = ev; worstEVIdx = c }
    if (ev >= 1.0) valueBetCount++
  }

  // 中央値: 的中確率と安定度積の両方
  const sortedProbs = [...probabilities].sort((a, b) => a - b)
  const medianProbability = comboCount % 2 === 0
    ? (sortedProbs[comboCount / 2 - 1] + sortedProbs[comboCount / 2]) / 2
    : sortedProbs[Math.floor(comboCount / 2)]

  const sortedStabilities = Array.from(comboStabilities).sort((a, b) => a - b)
  const medianStability = comboCount % 2 === 0
    ? (sortedStabilities[comboCount / 2 - 1] + sortedStabilities[comboCount / 2]) / 2
    : sortedStabilities[Math.floor(comboCount / 2)]

  // 2軸推奨度分類
  for (let c = 0; c < comboCount; c++) {
    const combo = combinationResults[c]
    combo.tier = classifyTier2Axis(combo.probability, medianProbability, combo.comboStability, medianStability, combo.ev)
  }

  // 馬別統計（複勝確率 + 安定度の2軸）
  const horseStats: HorseValueStats[] = []
  // 複勝確率の生値（正規化前）
  const rawPlaceProbs = new Float64Array(n)
  for (let h = 0; h < n; h++) {
    const idxH = includedIndices[h]
    const placeMid = (placeOddsArr[idxH].low + placeOddsArr[idxH].high) / 2
    rawPlaceProbs[h] = 0.80 / placeMid
  }

  for (let h = 0; h < n; h++) {
    let totalCombos = 0
    let recommendedCombos = 0
    let sumEV = 0
    let bestHorseEV = -Infinity

    for (let c = 0; c < comboCount; c++) {
      const [li, lj, lk] = comboLocalIndices[c]
      if (li === h || lj === h || lk === h) {
        totalCombos++
        sumEV += combinationResults[c].ev
        if (combinationResults[c].ev > bestHorseEV) {
          bestHorseEV = combinationResults[c].ev
        }
        if (combinationResults[c].tier === 'recommended') {
          recommendedCombos++
        }
      }
    }

    horseStats.push({
      horseNumber: includedIndices[h] + 1,
      horseName: horseNames?.[includedIndices[h]] || '',
      placeProbability: rawPlaceProbs[h],
      stability: stability[h],
      totalCombinations: totalCombos,
      recommendedCount: recommendedCombos,
      averageEV: totalCombos > 0 ? sumEV / totalCombos : 0,
      bestEV: bestHorseEV,
    })
  }

  // 複勝確率の降順でソート（的中可能性が高い順）
  horseStats.sort((a, b) => b.placeProbability - a.placeProbability)

  return {
    totalStakes: totalStakesAll,
    weightedReturn: sumWeightedReturn,
    combinations: combinationResults,
    valueBetCount,
    horseStats,
    medianProbability,
    bestEV: {
      value: bestEVValue,
      horses: comboHorses[bestEVIdx],
      odds: combinationResults[bestEVIdx].approximateOdds,
    },
    worstEV: {
      value: worstEVValue,
      horses: comboHorses[worstEVIdx],
      odds: combinationResults[worstEVIdx].approximateOdds,
    },
  }
}

/**
 * Harvilleフォールバックモデル（複勝オッズなし時）
 */
function calculateWithHarville(
  includedIndices: number[],
  currentStakes: number[],
  winOdds: number[],
  horseNames?: string[]
): CalculationResult | null {
  const n = includedIndices.length
  const STAKE_PER_COMBO = 100

  const p_norm = new Float64Array(n)
  let sum_p_raw = 0

  for (let i = 0; i < n; i++) {
    const p = 0.8 / winOdds[includedIndices[i]]
    p_norm[i] = p
    sum_p_raw += p
  }
  for (let i = 0; i < n; i++) {
    p_norm[i] /= sum_p_raw
  }

  const comboCount = n * (n - 1) * (n - 2) / 6
  const naiveProbs = new Float64Array(comboCount)
  const harvilleProbs = new Float64Array(comboCount)
  const comboHorses: number[][] = new Array(comboCount)
  const comboLocalIndices: [number, number, number][] = new Array(comboCount)

  let idx = 0
  let totalNaive = 0
  let totalHarville = 0

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        naiveProbs[idx] = p_norm[i] * p_norm[j] * p_norm[k]
        harvilleProbs[idx] = harvilleTrifecta(p_norm[i], p_norm[j], p_norm[k])
        comboHorses[idx] = [includedIndices[i] + 1, includedIndices[j] + 1, includedIndices[k] + 1]
        comboLocalIndices[idx] = [i, j, k]
        totalNaive += naiveProbs[idx]
        totalHarville += harvilleProbs[idx]
        idx++
      }
    }
  }

  const totalStakesAll = comboCount * STAKE_PER_COMBO
  let sumWeightedReturn = 0
  const combinationResults: CombinationResult[] = new Array(comboCount)
  const probabilities: number[] = new Array(comboCount)

  let bestEVValue = -Infinity
  let worstEVValue = Infinity
  let bestEVIdx = 0
  let worstEVIdx = 0
  let valueBetCount = 0

  for (let c = 0; c < comboCount; c++) {
    const P_naive = naiveProbs[c] / totalNaive
    const P_harville = harvilleProbs[c] / totalHarville
    const marketOdds = 0.75 / P_naive
    const comboReturn = STAKE_PER_COMBO * marketOdds
    const ev = marketOdds * P_harville

    probabilities[c] = P_harville

    combinationResults[c] = {
      horses: comboHorses[c],
      stake: STAKE_PER_COMBO,
      approximateOdds: marketOdds,
      expectedReturn: comboReturn,
      probability: P_harville,
      ev,
      tier: 'avoid',
      comboStability: 0,
    }

    sumWeightedReturn += comboReturn * P_harville

    if (ev > bestEVValue) { bestEVValue = ev; bestEVIdx = c }
    if (ev < worstEVValue) { worstEVValue = ev; worstEVIdx = c }
    if (ev >= 1.0) valueBetCount++
  }

  const sortedProbs = [...probabilities].sort((a, b) => a - b)
  const medianProbability = comboCount % 2 === 0
    ? (sortedProbs[comboCount / 2 - 1] + sortedProbs[comboCount / 2]) / 2
    : sortedProbs[Math.floor(comboCount / 2)]

  for (let c = 0; c < comboCount; c++) {
    const combo = combinationResults[c]
    combo.tier = classifyTier(combo.ev, combo.probability, medianProbability)
  }

  const horseStats: HorseValueStats[] = []
  for (let h = 0; h < n; h++) {
    let totalCombos = 0
    let recommendedCombos = 0
    let sumEV = 0
    let bestHorseEV = -Infinity

    for (let c = 0; c < comboCount; c++) {
      const [li, lj, lk] = comboLocalIndices[c]
      if (li === h || lj === h || lk === h) {
        totalCombos++
        sumEV += combinationResults[c].ev
        if (combinationResults[c].ev > bestHorseEV) bestHorseEV = combinationResults[c].ev
        if (combinationResults[c].tier === 'recommended') recommendedCombos++
      }
    }

    horseStats.push({
      horseNumber: includedIndices[h] + 1,
      horseName: horseNames?.[includedIndices[h]] || '',
      placeProbability: 0,
      stability: 0,
      totalCombinations: totalCombos,
      recommendedCount: recommendedCombos,
      averageEV: totalCombos > 0 ? sumEV / totalCombos : 0,
      bestEV: bestHorseEV,
    })
  }

  horseStats.sort((a, b) => b.recommendedCount - a.recommendedCount || b.averageEV - a.averageEV)

  return {
    totalStakes: totalStakesAll,
    weightedReturn: sumWeightedReturn,
    combinations: combinationResults,
    valueBetCount,
    horseStats,
    medianProbability,
    bestEV: {
      value: bestEVValue,
      horses: comboHorses[bestEVIdx],
      odds: combinationResults[bestEVIdx].approximateOdds,
    },
    worstEV: {
      value: worstEVValue,
      horses: comboHorses[worstEVIdx],
      odds: combinationResults[worstEVIdx].approximateOdds,
    },
  }
}

export const calculateResultsForStakes = (
  currentStakes: number[],
  winOdds: number[],
  placeOddsArr: PlaceOdds[],
  horseNames?: string[]
): CalculationResult | null => {
  try {
    const includedIndices: number[] = []
    for (let i = 0; i < currentStakes.length; i++) {
      if (currentStakes[i] >= 100) includedIndices.push(i)
    }

    const n = includedIndices.length
    if (n < 3) return null

    // 複勝オッズがある場合は新モデル、なければHarvilleフォールバック
    if (hasPlaceOdds(placeOddsArr)) {
      return calculateWithPlaceOdds(includedIndices, currentStakes, winOdds, placeOddsArr, horseNames)
    } else {
      return calculateWithHarville(includedIndices, currentStakes, winOdds, horseNames)
    }
  } catch (error) {
    console.error('Error in calculateResultsForStakes:', error)
    return null
  }
}

/**
 * 2軸推奨度分類（複勝オッズモデル用）
 *
 * 軸1: 的中確率（複勝ベース） — 中央値との比較
 * 軸2: 期待回収率（安定度積） — 中央値との比較
 *
 * - 推奨: 確率≥中央値 & 安定度≥中央値 → 当たりやすく割安
 * - 有望: 確率≥中央値 & 安定度<中央値 & EV≥1.0 → 当たりやすく、期待回収率も高い
 * - 堅実: 確率≥中央値 & 安定度<中央値 & EV<1.0 → 当たりやすいが配当面は不利
 * - 穴狙い: 確率<中央値 & 安定度≥中央値 → 当たりにくいが割安
 * - 非推奨: 確率<中央値 & 安定度<中央値 → 当たりにくく割高
 */
function classifyTier2Axis(
  probability: number,
  medianProbability: number,
  comboStability: number,
  medianStability: number,
  ev: number,
): RecommendationTier {
  const highProb = probability >= medianProbability
  const highValue = comboStability >= medianStability
  if (highProb && highValue) return 'recommended'
  if (highProb) return ev >= 1.0 ? 'promising' : 'solid'
  if (highValue) return 'longshot'
  return 'avoid'
}

/**
 * 推奨度分類（Harvilleフォールバック用）
 *
 * 複勝オッズがない場合はEVと確率の1軸で分類。
 * 新しいtier名に統一: recommended / solid / longshot / avoid
 */
function classifyTier(
  ev: number,
  probability: number,
  medianProbability: number,
): RecommendationTier {
  if (ev >= 1.0) {
    return probability >= medianProbability ? 'recommended' : 'longshot'
  }
  if (ev >= 0.90) {
    return 'solid'
  }
  return 'avoid'
}
