import { combinations } from './combinations'
import { harvilleTrifecta } from './harville'
import { calculateResultsForStakes } from './calculateResults'
import type { CalculationResult } from './types'

function* generatePatterns(length: number, weights: number[]): Generator<number[]> {
  const pattern = new Array(length).fill(weights[0])
  yield [...pattern]

  while (true) {
    let pos = length - 1
    while (pos >= 0) {
      const currentIndex = weights.indexOf(pattern[pos])
      if (currentIndex < weights.length - 1) {
        pattern[pos] = weights[currentIndex + 1]
        for (let i = pos + 1; i < length; i++) {
          pattern[i] = weights[0]
        }
        break
      }
      pos--
    }
    if (pos < 0) break
    yield [...pattern]
  }
}

// 最適化ループ用の軽量計算関数
// calculateResultsForStakes と同じ2モデル比較ロジックだが、
// オッズ依存の値を事前計算して受け取ることで重複計算を排除
const calculateEVFast = (
  stakeValues: number[],
  comboIndices: number[][],
  naiveProbs: number[],
  totalNaive: number,
  harvilleProbs: number[],
  totalHarville: number
): { weightedReturn: number; totalStakes: number } => {
  let totalStakes = 0
  let sumWeightedReturn = 0

  for (let c = 0; c < comboIndices.length; c++) {
    const comboStakeSum = comboIndices[c].reduce((sum, idx) => sum + stakeValues[idx], 0)

    // 市場モデル(単純積)でオッズを算出
    const P_naive = naiveProbs[c] / totalNaive
    const marketOdds = 0.75 / P_naive
    const comboReturn = comboStakeSum * marketOdds

    // Harville確率で加重
    const P_harville = harvilleProbs[c] / totalHarville
    sumWeightedReturn += comboReturn * P_harville

    totalStakes += comboStakeSum
  }

  return { weightedReturn: sumWeightedReturn, totalStakes }
}

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
  if (validHorseIndices.length < 3) {
    throw new Error('3頭以上の馬を選択してください')
  }

  const weights = Array.from({ length: 10 }, (_, i) => (i + 1) * 100)
  const totalPatterns = Math.pow(weights.length, validHorseIndices.length)
  let currentPattern = 0

  // === オッズ依存の値を1回だけ事前計算 ===
  const includedOdds = validHorseIndices.map(i => odds[i])
  const p_raw = includedOdds.map(o => 0.8 / o)
  const sum_p_raw = p_raw.reduce((acc, v) => acc + v, 0)
  const p_norm = p_raw.map(v => v / sum_p_raw)

  // 3頭の組み合わせインデックス（例: 6頭なら C(6,3)=20通り）
  const n = validHorseIndices.length
  const comboIndices = combinations(Array.from({ length: n }, (_, i) => i), 3)

  // 各組み合わせの確率を2モデルで事前計算（パターンに依存しない）
  const naiveProbs = comboIndices.map(combo =>
    combo.reduce((prod, idx) => prod * p_norm[idx], 1)
  )
  const totalNaive = naiveProbs.reduce((sum, p) => sum + p, 0)

  const harvilleProbs = comboIndices.map(combo =>
    harvilleTrifecta(p_norm[combo[0]], p_norm[combo[1]], p_norm[combo[2]])
  )
  const totalHarville = harvilleProbs.reduce((sum, p) => sum + p, 0)

  let maxExpectedValue = -Infinity
  let optimalPattern: number[] | null = null

  // generatorを1パターンずつ処理（配列に一括変換しない）
  const gen = generatePatterns(n, weights)
  let next = gen.next()
  while (!next.done) {
    const pattern = next.value

    // 軽量計算: オッズ依存値は事前計算済み、stakes だけが変わる
    const { weightedReturn, totalStakes } = calculateEVFast(
      pattern,
      comboIndices,
      naiveProbs,
      totalNaive,
      harvilleProbs,
      totalHarville
    )

    if (totalStakes > 0) {
      const expectedValue = weightedReturn / totalStakes

      if (expectedValue > maxExpectedValue) {
        maxExpectedValue = expectedValue
        optimalPattern = [...pattern]
      }
    }

    currentPattern++
    if (currentPattern % 10000 === 0) {
      onProgress(currentPattern / totalPatterns, maxExpectedValue)
      await new Promise(resolve => setTimeout(resolve, 0))
    }

    next = gen.next()
  }

  if (!optimalPattern) {
    throw new Error('有効な組み合わせが見つかりませんでした')
  }

  // 最適パターンに対してのみ、完全な結果を計算
  const optimalStakes = Array(18).fill(0)
  validHorseIndices.forEach((horseIndex, i) => {
    optimalStakes[horseIndex] = optimalPattern![i]
  })

  const optimalResults = calculateResultsForStakes(optimalStakes, odds)
  if (!optimalResults) {
    throw new Error('有効な組み合わせが見つかりませんでした')
  }

  return {
    optimalStakes,
    optimalResults,
    maxExpectedValue,
    allPatterns: [] // 全パターン保持は不要（メモリ節約）
  }
}
