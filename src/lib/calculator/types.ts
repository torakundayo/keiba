export type RecommendationTier = 'recommended' | 'promising' | 'solid' | 'longshot' | 'avoid'

export type CombinationResult = {
  horses: number[]
  stake: number
  approximateOdds: number
  expectedReturn: number
  probability: number
  ev: number
  tier: RecommendationTier
  comboStability: number
}

export type HorseValueStats = {
  horseNumber: number
  horseName: string
  placeProbability: number
  stability: number
  totalCombinations: number
  recommendedCount: number
  averageEV: number
  bestEV: number
}

export type CalculationResult = {
  totalStakes: number
  weightedReturn: number
  combinations: CombinationResult[]
  valueBetCount: number
  horseStats: HorseValueStats[]
  medianProbability: number
  bestEV: {
    value: number
    horses: number[]
    odds: number
  }
  worstEV: {
    value: number
    horses: number[]
    odds: number
  }
}

export type SortConfig = {
  key: keyof CombinationResult
  direction: 'asc' | 'desc'
} | null

export type Race = {
  name: string
  url: string
  date: string
}

export type PlaceOdds = {
  low: number
  high: number
}

export type HorseOdds = {
  name: string
  odds: number
  placeOdds: PlaceOdds
}

export type RaceResponse = {
  races: Race[]
}

export const RESULTS_PER_PAGE = {
  mobile: 20,
  desktop: 21,
}
