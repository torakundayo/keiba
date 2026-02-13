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

  let maxExpectedValue = -Infinity
  let optimalStakes = Array(18).fill(0)
  let optimalResults: CalculationResult | null = null

  const allPatterns: {
    pattern: number[]
    expectedValue: number
    horses: number[]
  }[] = []

  const patterns = Array.from(generatePatterns(validHorseIndices.length, weights))

  for (const pattern of patterns) {
    const currentStakes = Array(18).fill(0)
    validHorseIndices.forEach((horseIndex, i) => {
      currentStakes[horseIndex] = pattern[i]
    })

    const currentResults = calculateResultsForStakes(currentStakes, odds)

    if (currentResults) {
      const expectedValue = currentResults.weightedReturn / currentResults.totalStakes

      allPatterns.push({
        pattern: pattern,
        expectedValue: expectedValue,
        horses: validHorseIndices.map(i => i + 1)
      })

      if (expectedValue > maxExpectedValue) {
        maxExpectedValue = expectedValue
        optimalStakes = [...currentStakes]
        optimalResults = currentResults
      }
    }

    currentPattern++
    if (currentPattern % 1000 === 0) {
      onProgress(currentPattern / totalPatterns, maxExpectedValue)
      await new Promise(resolve => setTimeout(resolve, 0))
    }
  }

  const sortedPatterns = allPatterns.sort((a, b) => b.expectedValue - a.expectedValue)

  if (!optimalResults) {
    throw new Error('有効な組み合わせが見つかりませんでした')
  }

  return {
    optimalStakes,
    optimalResults: optimalResults!,
    maxExpectedValue,
    allPatterns: sortedPatterns
  }
}
