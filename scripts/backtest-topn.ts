/**
 * Phase 1: Top-N確率順バックテスト
 *
 * 既存のバックテストキャッシュ（レースID・結果）を再利用し、
 * オッズのみ再取得して確率順Top-N戦略を検証する。
 *
 * Usage:
 *   npx tsx scripts/backtest-topn.ts
 */

import * as cheerio from 'cheerio'
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { calculateResultsForStakes } from '../src/lib/calculator/calculateResults'
import type { PlaceOdds, CombinationResult } from '../src/lib/calculator/types'

// ===================== Configuration =====================

const BASE_URL = 'https://www.keibalab.jp'
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
const DELAY_MS = 600

const PROJECT_ROOT = process.cwd()
const DATA_DIR = join(PROJECT_ROOT, 'data')
const CACHE_FILE = join(DATA_DIR, 'backtest-cache.json')
const ODDS_CACHE_FILE = join(DATA_DIR, 'backtest-odds-cache.json')
const OUTPUT_FILE = join(DATA_DIR, 'backtest-topn-results.json')
const PUBLIC_OUTPUT = join(PROJECT_ROOT, 'public', 'data', 'backtest-topn-results.json')

const TOP_N_VALUES = [1, 3, 5, 10, 15, 20]

// ===================== Types =====================

interface HorseOddsData {
  name: string
  odds: number
  placeOddsLow: number
  placeOddsHigh: number
}

interface CachedRace {
  raceId: string
  raceName: string
  date: string
  venue: string
  raceNumber: number
  horseCount: number
  trifectaPayout: number
  trifectaCombo: number[]
}

interface RaceTopNResult {
  raceId: string
  raceName: string
  date: string
  venue: string
  raceNumber: number
  horseCount: number
  totalCombinations: number
  trifectaPayout: number
  trifectaCombo: number[]
  winComboRankByProb: number  // 1-indexed rank of winning combo by probability
  winComboRankByEV: number
  winComboProb: number
  winComboEV: number
  topNResults: {
    n: number
    hitByProb: boolean
    hitByEV: boolean
  }[]
}

interface TopNAggregate {
  n: number
  costPerRace: number
  // By probability ranking
  probHits: number
  probHitRate: number
  probTotalPayout: number
  probROI: number
  probAvgPayoutPerHit: number
  // By EV ranking
  evHits: number
  evHitRate: number
  evTotalPayout: number
  evROI: number
  evAvgPayoutPerHit: number
}

// ===================== Utilities =====================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchPage(url: string, retries = 3): Promise<string> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': USER_AGENT },
      })
      if (response.status === 404) return ''
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      return await response.text()
    } catch (e) {
      if (attempt === retries - 1) throw e
      await sleep(3000)
    }
  }
  return ''
}

async function getOdds(raceId: string): Promise<HorseOddsData[]> {
  const url = `${BASE_URL}/db/race/${raceId}/odds.html`
  const html = await fetchPage(url)
  if (!html) return []

  const $ = cheerio.load(html)
  const horses: HorseOddsData[] = []

  $('#oddsTanTable tbody tr').each((_, row) => {
    const tds = $(row).find('td')
    if (tds.length < 7) return

    const horseName = $(tds[2]).text().trim()
    const winOddsText = $(tds[3]).find('i').text().trim()
    const placeLowText = $(tds[4]).find('i').text().trim()
    const placeHighText = $(tds[6]).find('i').text().trim()

    if (horseName) {
      horses.push({
        name: horseName,
        odds: parseFloat(winOddsText) || 0,
        placeOddsLow: parseFloat(placeLowText) || 0,
        placeOddsHigh: parseFloat(placeHighText) || 0,
      })
    }
  })

  return horses
}

// ===================== Main Logic =====================

function processRaceTopN(
  odds: HorseOddsData[],
  cached: CachedRace
): RaceTopNResult | null {
  if (odds.length < 3) return null
  if (cached.trifectaPayout <= 0) return null
  if (cached.trifectaCombo.length !== 3) return null

  // Run calculation (include all horses)
  const stakes = odds.map(h => (h.odds > 0 ? 100 : 0))
  const winOdds = odds.map(h => h.odds || 999)
  const placeOddsArr: PlaceOdds[] = odds.map(h => ({
    low: h.placeOddsLow,
    high: h.placeOddsHigh,
  }))
  const names = odds.map(h => h.name)

  const calcResult = calculateResultsForStakes(stakes, winOdds, placeOddsArr, names)
  if (!calcResult) return null

  const combos = calcResult.combinations
  const winKey = cached.trifectaCombo.join('-')

  // Sort by probability (desc) and by EV (desc)
  const byProb = [...combos].sort((a, b) => b.probability - a.probability)
  const byEV = [...combos].sort((a, b) => b.ev - a.ev)

  // Find winning combo's rank
  let winRankProb = -1
  let winRankEV = -1
  let winComboProb = 0
  let winComboEV = 0

  for (let i = 0; i < byProb.length; i++) {
    const key = [...byProb[i].horses].sort((a, b) => a - b).join('-')
    if (key === winKey) {
      winRankProb = i + 1
      winComboProb = byProb[i].probability
      winComboEV = byProb[i].ev
      break
    }
  }

  for (let i = 0; i < byEV.length; i++) {
    const key = [...byEV[i].horses].sort((a, b) => a - b).join('-')
    if (key === winKey) {
      winRankEV = i + 1
      break
    }
  }

  // Evaluate top-N strategies
  const topNResults = TOP_N_VALUES.map(n => {
    const topNProb = new Set(
      byProb.slice(0, n).map(c => [...c.horses].sort((a, b) => a - b).join('-'))
    )
    const topNEV = new Set(
      byEV.slice(0, n).map(c => [...c.horses].sort((a, b) => a - b).join('-'))
    )

    return {
      n,
      hitByProb: topNProb.has(winKey),
      hitByEV: topNEV.has(winKey),
    }
  })

  return {
    raceId: cached.raceId,
    raceName: cached.raceName,
    date: cached.date,
    venue: cached.venue,
    raceNumber: cached.raceNumber,
    horseCount: odds.length,
    totalCombinations: combos.length,
    trifectaPayout: cached.trifectaPayout,
    trifectaCombo: cached.trifectaCombo,
    winComboRankByProb: winRankProb,
    winComboRankByEV: winRankEV,
    winComboProb,
    winComboEV,
    topNResults,
  }
}

// ===================== Main =====================

async function main() {
  console.log('=== Phase 1: Top-N確率順バックテスト ===\n')

  // Load existing backtest cache
  if (!existsSync(CACHE_FILE)) {
    console.error('backtest-cache.json not found. Run backtest.ts first.')
    process.exit(1)
  }
  const backtestCache = JSON.parse(readFileSync(CACHE_FILE, 'utf-8'))
  const cachedRaces: CachedRace[] = Object.values(backtestCache.processedRaces)

  console.log(`既存キャッシュ: ${cachedRaces.length} races`)

  // Load or create odds cache
  let oddsCache: Record<string, HorseOddsData[]> = {}
  if (existsSync(ODDS_CACHE_FILE)) {
    oddsCache = JSON.parse(readFileSync(ODDS_CACHE_FILE, 'utf-8'))
    console.log(`オッズキャッシュ: ${Object.keys(oddsCache).length} races`)
  }

  // Fetch missing odds
  let fetchCount = 0
  const missingIds = cachedRaces
    .filter(r => !oddsCache[r.raceId])
    .map(r => r.raceId)

  console.log(`未取得オッズ: ${missingIds.length} races\n`)

  for (let i = 0; i < missingIds.length; i++) {
    const raceId = missingIds[i]
    try {
      await sleep(DELAY_MS)
      const odds = await getOdds(raceId)
      if (odds.length > 0) {
        oddsCache[raceId] = odds
        fetchCount++
      }

      if ((i + 1) % 50 === 0 || i === missingIds.length - 1) {
        console.log(`  Fetched ${i + 1}/${missingIds.length} (${fetchCount} valid)`)
        writeFileSync(ODDS_CACHE_FILE, JSON.stringify(oddsCache), 'utf-8')
      }
    } catch (e) {
      console.error(`  Error fetching ${raceId}: ${e}`)
    }
  }

  if (fetchCount > 0) {
    writeFileSync(ODDS_CACHE_FILE, JSON.stringify(oddsCache), 'utf-8')
    console.log(`\nオッズキャッシュ保存: ${Object.keys(oddsCache).length} races`)
  }

  // Process all races
  console.log('\n計算中...')
  const results: RaceTopNResult[] = []
  let skipped = 0

  for (const cached of cachedRaces) {
    const odds = oddsCache[cached.raceId]
    if (!odds || odds.length < 3) {
      skipped++
      continue
    }

    const result = processRaceTopN(odds, cached)
    if (result) {
      results.push(result)
    } else {
      skipped++
    }
  }

  console.log(`処理完了: ${results.length} races (skipped: ${skipped})`)

  // === Aggregate Statistics ===

  // 1. Winning combo probability rank distribution
  const ranks = results.map(r => r.winComboRankByProb).filter(r => r > 0).sort((a, b) => a - b)
  const evRanks = results.map(r => r.winComboRankByEV).filter(r => r > 0).sort((a, b) => a - b)
  const totalCombos = results.map(r => r.totalCombinations)
  const avgTotalCombos = totalCombos.reduce((s, v) => s + v, 0) / totalCombos.length

  console.log('\n=== 的中組み合わせの確率順位分布 ===')
  console.log(`平均総組み合わせ数: ${avgTotalCombos.toFixed(0)}`)
  console.log(`\n確率順位:`)
  console.log(`  min: ${ranks[0]}`)
  console.log(`  25%: ${ranks[Math.floor(ranks.length * 0.25)]}`)
  console.log(`  med: ${ranks[Math.floor(ranks.length * 0.5)]}`)
  console.log(`  75%: ${ranks[Math.floor(ranks.length * 0.75)]}`)
  console.log(`  max: ${ranks[ranks.length - 1]}`)

  console.log(`\nEV順位:`)
  console.log(`  min: ${evRanks[0]}`)
  console.log(`  25%: ${evRanks[Math.floor(evRanks.length * 0.25)]}`)
  console.log(`  med: ${evRanks[Math.floor(evRanks.length * 0.5)]}`)
  console.log(`  75%: ${evRanks[Math.floor(evRanks.length * 0.75)]}`)
  console.log(`  max: ${evRanks[evRanks.length - 1]}`)

  // Percentile analysis
  console.log('\n=== 確率上位N%に的中が含まれる割合 ===')
  for (const pct of [1, 2, 5, 10, 20, 50]) {
    const threshold = Math.ceil(avgTotalCombos * pct / 100)
    const hitCount = ranks.filter(r => r <= threshold).length
    console.log(`  上位${pct}% (${threshold}点): ${hitCount}/${ranks.length} = ${(hitCount / ranks.length * 100).toFixed(1)}%`)
  }

  // 2. Top-N strategy performance
  console.log('\n=== Top-N戦略パフォーマンス ===')
  const topNAggs: TopNAggregate[] = TOP_N_VALUES.map(n => {
    const costPerRace = n * 100
    const totalCost = costPerRace * results.length

    let probHits = 0
    let probTotalPayout = 0
    let evHits = 0
    let evTotalPayout = 0

    for (const r of results) {
      const tn = r.topNResults.find(t => t.n === n)
      if (tn?.hitByProb) {
        probHits++
        probTotalPayout += r.trifectaPayout
      }
      if (tn?.hitByEV) {
        evHits++
        evTotalPayout += r.trifectaPayout
      }
    }

    return {
      n,
      costPerRace,
      probHits,
      probHitRate: probHits / results.length,
      probTotalPayout,
      probROI: (probTotalPayout - totalCost) / totalCost,
      probAvgPayoutPerHit: probHits > 0 ? probTotalPayout / probHits : 0,
      evHits,
      evHitRate: evHits / results.length,
      evTotalPayout,
      evROI: (evTotalPayout - totalCost) / totalCost,
      evAvgPayoutPerHit: evHits > 0 ? evTotalPayout / evHits : 0,
    }
  })

  console.log('\n確率順 Top-N:')
  console.log('  N  | Cost/R |  Hits | HitRate |  AvgPayout | TotalPay  | TotalCost |    ROI')
  console.log('  ---+--------+-------+---------+------------+-----------+-----------+--------')
  for (const a of topNAggs) {
    console.log(
      `  ${String(a.n).padStart(2)} | ${String(a.costPerRace).padStart(5)}円 | ` +
      `${String(a.probHits).padStart(5)} | ${(a.probHitRate * 100).toFixed(1).padStart(6)}% | ` +
      `${String(Math.round(a.probAvgPayoutPerHit)).padStart(9)}円 | ` +
      `${String(Math.round(a.probTotalPayout)).padStart(8)}円 | ` +
      `${String(a.costPerRace * results.length).padStart(8)}円 | ` +
      `${(a.probROI * 100).toFixed(1).padStart(6)}%`
    )
  }

  console.log('\nEV順 Top-N:')
  console.log('  N  | Cost/R |  Hits | HitRate |  AvgPayout | TotalPay  | TotalCost |    ROI')
  console.log('  ---+--------+-------+---------+------------+-----------+-----------+--------')
  for (const a of topNAggs) {
    console.log(
      `  ${String(a.n).padStart(2)} | ${String(a.costPerRace).padStart(5)}円 | ` +
      `${String(a.evHits).padStart(5)} | ${(a.evHitRate * 100).toFixed(1).padStart(6)}% | ` +
      `${String(Math.round(a.evAvgPayoutPerHit)).padStart(9)}円 | ` +
      `${String(Math.round(a.evTotalPayout)).padStart(8)}円 | ` +
      `${String(a.costPerRace * results.length).padStart(8)}円 | ` +
      `${(a.evROI * 100).toFixed(1).padStart(6)}%`
    )
  }

  // Random baseline
  const randomHitRate1 = 1 / avgTotalCombos
  console.log(`\n参考: ランダム1点の的中率 = ${(randomHitRate1 * 100).toFixed(3)}%`)
  for (const n of TOP_N_VALUES) {
    const rhr = 1 - Math.pow(1 - randomHitRate1, n)
    console.log(`  ランダム${n}点の的中率 = ${(rhr * 100).toFixed(2)}%`)
  }

  // Save results
  const summary = {
    totalRaces: results.length,
    dateRange: {
      from: results.sort((a, b) => a.date.localeCompare(b.date))[0]?.date,
      to: results[results.length - 1]?.date,
    },
    generatedAt: new Date().toISOString(),
    avgTotalCombinations: avgTotalCombos,
    winComboRankDistribution: {
      byProb: {
        min: ranks[0],
        p25: ranks[Math.floor(ranks.length * 0.25)],
        median: ranks[Math.floor(ranks.length * 0.5)],
        p75: ranks[Math.floor(ranks.length * 0.75)],
        max: ranks[ranks.length - 1],
      },
      byEV: {
        min: evRanks[0],
        p25: evRanks[Math.floor(evRanks.length * 0.25)],
        median: evRanks[Math.floor(evRanks.length * 0.5)],
        p75: evRanks[Math.floor(evRanks.length * 0.75)],
        max: evRanks[evRanks.length - 1],
      },
    },
    topNStrategies: topNAggs,
    races: results,
  }

  writeFileSync(OUTPUT_FILE, JSON.stringify(summary, null, 2), 'utf-8')

  const publicDir = join(PROJECT_ROOT, 'public', 'data')
  if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true })
  writeFileSync(PUBLIC_OUTPUT, JSON.stringify(summary, null, 2), 'utf-8')

  console.log(`\nResults saved to ${OUTPUT_FILE}`)
}

main().catch(console.error)
