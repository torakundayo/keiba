export type CombinationResult = {
  horses: number[]
  stake: number
  approximateOdds: number
  expectedReturn: number
  probability: number
}

export type CalculationResult = {
  totalStakes: number
  weightedReturn: number
  combinations: CombinationResult[]
  minReturn: {
    value: number
    horses: number[]
    odds: number
  }
  maxReturn: {
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

export type HorseOdds = {
  name: string
  odds: number
}

export type RaceResponse = {
  races: Race[]
}

export type OptimizationProgress = {
  current: number
  total: number
  bestValue: number
}

export const RESULTS_PER_PAGE = {
  mobile: 20,
  desktop: 21,
}
