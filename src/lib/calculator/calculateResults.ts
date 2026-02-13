import { combinations } from './combinations'
import type { CalculationResult, CombinationResult } from './types'

export const calculateResultsForStakes = (
  currentStakes: number[],
  odds: number[]
): CalculationResult | null => {
  try {
    const includedIndices = currentStakes.map((s, i) => ({ s, i }))
      .filter(obj => obj.s >= 100)
      .map(obj => obj.i)

    if (includedIndices.length < 3) {
      return null
    }

    const includedStakes = includedIndices.map(i => currentStakes[i])
    const includedOdds = includedIndices.map(i => odds[i])

    // 生の確率を計算 (オッズから逆算、0.8は単勝市場の払戻率)
    const p_raw = includedOdds.map(o => 0.8 / o)
    const sum_p_raw = p_raw.reduce((acc, v) => acc + v, 0)
    const p_norm = p_raw.map(v => v / sum_p_raw)

    const combosStakes = combinations(includedStakes, 3)
    const combosPnorm = combinations(p_norm, 3)

    // インデックスの組み合わせをループ外で1回だけ生成
    const indexCombos = combinations(
      Array.from({ length: includedIndices.length }, (_, i) => i),
      3
    )

    let totalStakesAllCombos = 0
    let sumD = 0
    let sumWeightedReturn = 0

    const combinationResults: CombinationResult[] = []

    for (let c = 0; c < combosStakes.length; c++) {
      const comboStakes = combosStakes[c]
      const comboP = combosPnorm[c]

      // 事前計算したインデックス組み合わせから馬番を取得
      const horses = indexCombos[c].map(idx => includedIndices[idx])

      const comboStakeSum = comboStakes.reduce((sum, val) => sum + val, 0)
      const P_ijk_raw = comboP.reduce((prod, p) => prod * p, 1)

      const combo = {
        horses: horses.map(i => i + 1),
        stake: comboStakeSum,
        expectedReturn: 0,
        approximateOdds: 0,
        probability: P_ijk_raw
      }

      combinationResults.push(combo)
    }

    const totalProb = combinationResults.reduce((sum, c) => sum + c.probability, 0)

    for (const combo of combinationResults) {
      const P_ijk = combo.probability / totalProb
      const trifectaOdds = 0.75 / P_ijk
      const comboReturn = combo.stake * trifectaOdds

      combo.probability = P_ijk
      combo.approximateOdds = trifectaOdds
      combo.expectedReturn = comboReturn

      totalStakesAllCombos += combo.stake
      sumD += P_ijk
      sumWeightedReturn += comboReturn * P_ijk
    }

    const weightedReturn = sumD > 0 ? sumWeightedReturn / sumD : 0

    const minReturn = Math.min(...combinationResults.map(c => c.expectedReturn))
    const maxReturn = Math.max(...combinationResults.map(c => c.expectedReturn))
    const minReturnCombo = combinationResults.find(c => c.expectedReturn === minReturn)
    const maxReturnCombo = combinationResults.find(c => c.expectedReturn === maxReturn)

    return {
      totalStakes: totalStakesAllCombos,
      weightedReturn: weightedReturn,
      combinations: combinationResults,
      minReturn: {
        value: minReturn,
        horses: minReturnCombo?.horses || [],
        odds: minReturnCombo?.approximateOdds || 0
      },
      maxReturn: {
        value: maxReturn,
        horses: maxReturnCombo?.horses || [],
        odds: maxReturnCombo?.approximateOdds || 0
      }
    }
  } catch (error) {
    console.error('Error in calculateResultsForStakes:', error)
    return null
  }
}
