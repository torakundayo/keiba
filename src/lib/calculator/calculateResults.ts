import { combinations } from './combinations'
import { harvilleTrifecta } from './harville'
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
    let sumWeightedReturn = 0

    const combinationResults: CombinationResult[] = []

    // Phase 1: 各組み合わせの2種類の確率を計算
    const naiveProbs: number[] = []
    const harvilleProbs: number[] = []

    for (let c = 0; c < combosStakes.length; c++) {
      const comboStakes = combosStakes[c]
      const comboP = combosPnorm[c]

      // 事前計算したインデックス組み合わせから馬番を取得
      const horses = indexCombos[c].map(idx => includedIndices[idx])

      const comboStakeSum = comboStakes.reduce((sum, val) => sum + val, 0)

      // 市場モデル: 単純積（市場がこの近似でオッズを形成していると仮定）
      const P_naive_raw = comboP.reduce((prod, p) => prod * p, 1)

      // 精密モデル: Harville（条件付き確率による精密推定）
      const P_harville_raw = harvilleTrifecta(comboP[0], comboP[1], comboP[2])

      naiveProbs.push(P_naive_raw)
      harvilleProbs.push(P_harville_raw)

      combinationResults.push({
        horses: horses.map(i => i + 1),
        stake: comboStakeSum,
        expectedReturn: 0,
        approximateOdds: 0,
        probability: 0,
      })
    }

    // Phase 2: 両モデルの確率を正規化し、オッズ・期待リターンを計算
    const totalNaive = naiveProbs.reduce((sum, p) => sum + p, 0)
    const totalHarville = harvilleProbs.reduce((sum, p) => sum + p, 0)

    for (let c = 0; c < combinationResults.length; c++) {
      const combo = combinationResults[c]

      const P_naive = naiveProbs[c] / totalNaive
      const P_harville = harvilleProbs[c] / totalHarville

      // 市場オッズ: 単純積モデルに基づく理論オッズ
      const marketOdds = 0.75 / P_naive

      // 期待リターン: 的中時の払戻金額
      const comboReturn = combo.stake * marketOdds

      combo.probability = P_harville
      combo.approximateOdds = marketOdds
      combo.expectedReturn = comboReturn

      totalStakesAllCombos += combo.stake

      // Harville確率で加重: EV = Σ(リターン × P_harville)
      sumWeightedReturn += comboReturn * P_harville
    }

    const weightedReturn = sumWeightedReturn

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
