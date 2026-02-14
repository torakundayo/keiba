/**
 * 3連複バックテストスクリプト
 *
 * 過去のレースデータをスクレイピングし、モデルの予測精度を検証する。
 *
 * Usage:
 *   npx tsx scripts/backtest.ts [--days N] [--test]
 *
 * Options:
 *   --days N    過去N日分を処理 (default: 90)
 *   --test      1レースだけテスト実行
 */

import * as cheerio from 'cheerio'
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { calculateResultsForStakes } from '../src/lib/calculator/calculateResults'
import type { PlaceOdds, RecommendationTier } from '../src/lib/calculator/types'

// ===================== Configuration =====================

const BASE_URL = 'https://www.keibalab.jp'
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
const DELAY_MS = 1200

const PROJECT_ROOT = process.cwd()
const DATA_DIR = join(PROJECT_ROOT, 'data')
const CACHE_FILE = join(DATA_DIR, 'backtest-cache.json')
const OUTPUT_FILE = join(DATA_DIR, 'backtest-results.json')

// CLI args
const args = process.argv.slice(2)
const daysArg = args.findIndex(a => a === '--days')
const DAYS_BACK = daysArg >= 0 ? parseInt(args[daysArg + 1] || '90', 10) : 90
const TEST_MODE = args.includes('--test')

// ===================== Types =====================

interface CachedRace {
  raceId: string
  raceName: string
  date: string
  venue: string
  raceNumber: number
  horseCount: number
  top3: number[]
  trifectaPayout: number
  trifectaCombo: number[]
  totalCombinations: number
  tierCounts: Record<string, number>
  winningComboTier: RecommendationTier | null
  strategies: {
    name: string
    tiers: string[]
    combos: number
    cost: number
    hit: boolean
    payout: number
  }[]
}

interface Cache {
  processedRaces: Record<string, CachedRace>
  processedDates: string[]
}

interface StrategyDef {
  name: string
  tiers: RecommendationTier[]
}

const STRATEGIES: StrategyDef[] = [
  { name: '推奨のみ', tiers: ['recommended'] },
  { name: '推奨＋有望', tiers: ['recommended', 'promising'] },
  { name: '有望のみ', tiers: ['promising'] },
]

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
      console.warn(`  Retry ${attempt + 1}/${retries} for ${url}`)
      await sleep(3000)
    }
  }
  return ''
}

function loadCache(): Cache {
  if (existsSync(CACHE_FILE)) {
    return JSON.parse(readFileSync(CACHE_FILE, 'utf-8'))
  }
  return { processedRaces: {}, processedDates: [] }
}

function saveCache(cache: Cache): void {
  writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8')
}

function generateDates(daysBack: number): string[] {
  const dates: string[] = []
  const today = new Date()

  for (let i = 1; i <= daysBack; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const day = d.getDay()
    // JRA races: Saturday (6), Sunday (0), occasional Monday holidays (1)
    if (day === 0 || day === 1 || day === 6) {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      dates.push(`${y}${m}${dd}`)
    }
  }

  return dates
}

// ===================== Scraping =====================

interface RaceInfo {
  raceId: string
  name: string
  url: string // base URL without odds.html
  venue: string
  raceNumber: number
}

async function getRacesForDate(dateStr: string): Promise<RaceInfo[]> {
  const html = await fetchPage(`${BASE_URL}/db/race/${dateStr}/`)
  if (!html) return []

  const $ = cheerio.load(html)
  const races: RaceInfo[] = []

  $('table.table.table-bordered.table-striped').each((_, table) => {
    const headerText = $(table).find('thead th').first().text().trim()
    const venueMatch = headerText.match(/\d+回(.+?)\d+日目/)
    const venue = venueMatch ? venueMatch[1] : headerText.split('\n')[0].trim()

    $(table).find('tbody tr').each((_, tr) => {
      const raceNumTd = $(tr).find('td.raceNum')
      const raceLink = raceNumTd.find('a').first()
      const raceNumText = raceLink.text().trim()
      const raceNumMatch = raceNumText.match(/(\d+)R/)
      if (!raceNumMatch) return

      const raceNumber = parseInt(raceNumMatch[1], 10)
      const infoTd = $(tr).find('td').eq(1)
      const nameLink = infoTd.find('a').first()
      const raceName = nameLink.text().trim()
      const href = nameLink.attr('href')
      if (!raceName || !href) return

      const idMatch = href.match(/\/db\/race\/(\d+)\//)
      const raceId = idMatch ? idMatch[1] : ''

      races.push({
        raceId,
        name: raceName,
        url: `${BASE_URL}${href}`,
        venue,
        raceNumber,
      })
    })
  })

  return races
}

interface HorseOddsData {
  name: string
  odds: number
  placeOddsLow: number
  placeOddsHigh: number
}

async function getOdds(raceUrl: string): Promise<HorseOddsData[]> {
  const html = await fetchPage(`${raceUrl}odds.html`)
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

interface RaceResults {
  top3: number[]
  trifectaPayout: number
  trifectaCombo: number[]
}

async function getResults(raceUrl: string): Promise<RaceResults> {
  const html = await fetchPage(raceUrl)
  if (!html) return { top3: [], trifectaPayout: 0, trifectaCombo: [] }

  const $ = cheerio.load(html)

  // === Parse top 3 finishers ===
  const top3: number[] = []

  // Find the result table by looking for a table with "着" in its headers
  $('table').each((_, table) => {
    if (top3.length >= 3) return false

    const $table = $(table)
    const headerText = $table
      .find('th')
      .map((_, th) => $(th).text().trim())
      .get()
      .join(' ')
    if (!headerText.includes('着')) return

    $table.find('tbody tr, tr').each((_, row) => {
      if (top3.length >= 3) return false

      const tds = $(row).find('td')
      if (tds.length < 4) return

      const posText = $(tds[0]).text().trim()
      const position = parseInt(posText, 10)

      if (position >= 1 && position <= 3) {
        const horseNumText = $(tds[2]).text().trim()
        const horseNum = parseInt(horseNumText, 10)
        if (!isNaN(horseNum) && horseNum > 0) {
          top3.push(horseNum)
        }
      }
    })
  })

  // === Parse 3連複 payout ===
  let trifectaPayout = 0
  let trifectaCombo: number[] = []

  // Approach 1: dt/dd structure
  $('dt').each((_, dt) => {
    if (trifectaPayout > 0) return false
    const dtText = $(dt).text().trim()
    if (dtText.includes('3連複') || dtText.includes('三連複')) {
      const dd = $(dt).next('dd')
      if (dd.length === 0) return

      const text = dd.text().trim()

      // Parse combination: "2-5-9" or variants with different dashes
      const comboMatch = text.match(
        /(\d+)\s*[-－ー―–]\s*(\d+)\s*[-－ー―–]\s*(\d+)/
      )
      if (comboMatch) {
        trifectaCombo = [
          parseInt(comboMatch[1]),
          parseInt(comboMatch[2]),
          parseInt(comboMatch[3]),
        ].sort((a, b) => a - b)
      }

      // Parse payout: "530円" or "1,640円"
      const payoutMatch = text.match(/([\d,]+)円/)
      if (payoutMatch) {
        trifectaPayout = parseInt(payoutMatch[1].replace(/,/g, ''), 10)
      }
    }
  })

  // Approach 2: Look in table cells
  if (trifectaPayout === 0) {
    $('td, th').each((_, el) => {
      if (trifectaPayout > 0) return false
      const text = $(el).text().trim()
      if (text === '3連複' || text === '三連複') {
        const row = $(el).parent()
        const cells = row.find('td')
        cells.each((_, cell) => {
          const cellText = $(cell).text().trim()

          if (trifectaCombo.length === 0) {
            const comboMatch = cellText.match(
              /(\d+)\s*[-－ー―–]\s*(\d+)\s*[-－ー―–]\s*(\d+)/
            )
            if (comboMatch) {
              trifectaCombo = [
                parseInt(comboMatch[1]),
                parseInt(comboMatch[2]),
                parseInt(comboMatch[3]),
              ].sort((a, b) => a - b)
            }
          }

          if (trifectaPayout === 0) {
            const payoutMatch = cellText.match(/([\d,]+)円/)
            if (payoutMatch) {
              const val = parseInt(payoutMatch[1].replace(/,/g, ''), 10)
              if (val > 100) trifectaPayout = val
            }
          }
        })
      }
    })
  }

  // Approach 3: Search full page text for 3連複 pattern
  if (trifectaPayout === 0) {
    const fullText = $.text()
    const triMatch = fullText.match(
      /3連複[^\d]*(\d+)\s*[-－ー―–]\s*(\d+)\s*[-－ー―–]\s*(\d+)[^\d]*([\d,]+)円/
    )
    if (triMatch) {
      trifectaCombo = [
        parseInt(triMatch[1]),
        parseInt(triMatch[2]),
        parseInt(triMatch[3]),
      ].sort((a, b) => a - b)
      trifectaPayout = parseInt(triMatch[4].replace(/,/g, ''), 10)
    }
  }

  // Derive combo from top3 if not found explicitly
  if (trifectaCombo.length === 0 && top3.length === 3) {
    trifectaCombo = [...top3].sort((a, b) => a - b)
  }

  return {
    top3: top3.sort((a, b) => a - b),
    trifectaPayout,
    trifectaCombo,
  }
}

// ===================== Backtest Logic =====================

function processRace(
  raceInfo: RaceInfo,
  dateStr: string,
  oddsData: HorseOddsData[],
  results: RaceResults
): CachedRace | null {
  const horseCount = oddsData.length
  if (horseCount < 3) return null
  if (results.top3.length < 3) return null
  if (results.trifectaPayout <= 0) return null

  // Prepare arrays for calculateResultsForStakes
  // Include all horses with valid odds
  const stakes = oddsData.map(h => (h.odds > 0 ? 100 : 0))
  const winOdds = oddsData.map(h => h.odds || 999)
  const placeOddsArr: PlaceOdds[] = oddsData.map(h => ({
    low: h.placeOddsLow,
    high: h.placeOddsHigh,
  }))
  const names = oddsData.map(h => h.name)

  // Run model
  const calcResult = calculateResultsForStakes(
    stakes,
    winOdds,
    placeOddsArr,
    names
  )
  if (!calcResult) return null

  const combos = calcResult.combinations

  // Count tiers
  const tierCounts: Record<string, number> = {
    recommended: 0,
    promising: 0,
    solid: 0,
    longshot: 0,
    avoid: 0,
  }
  for (const c of combos) {
    tierCounts[c.tier]++
  }

  // Find winning combo's tier in our model
  const winComboKey = results.trifectaCombo.join('-')

  let winningComboTier: RecommendationTier | null = null
  for (const c of combos) {
    const key = [...c.horses].sort((a, b) => a - b).join('-')
    if (key === winComboKey) {
      winningComboTier = c.tier
      break
    }
  }

  // Evaluate strategies
  const strategyResults = STRATEGIES.map(strat => {
    const matchingCombos = combos.filter(c =>
      (strat.tiers as string[]).includes(c.tier)
    )
    const combosCount = matchingCombos.length
    const cost = combosCount * 100

    let hit = false
    for (const c of matchingCombos) {
      const key = [...c.horses].sort((a, b) => a - b).join('-')
      if (key === winComboKey) {
        hit = true
        break
      }
    }

    return {
      name: strat.name,
      tiers: strat.tiers as string[],
      combos: combosCount,
      cost,
      hit,
      payout: hit ? results.trifectaPayout : 0,
    }
  })

  const dateFormatted = `${dateStr.slice(0, 4)}/${dateStr.slice(4, 6)}/${dateStr.slice(6, 8)}`

  return {
    raceId: raceInfo.raceId,
    raceName: raceInfo.name,
    date: dateFormatted,
    venue: raceInfo.venue,
    raceNumber: raceInfo.raceNumber,
    horseCount,
    top3: results.top3,
    trifectaPayout: results.trifectaPayout,
    trifectaCombo: results.trifectaCombo,
    totalCombinations: combos.length,
    tierCounts,
    winningComboTier,
    strategies: strategyResults,
  }
}

// ===================== Summary Generation =====================

function generateSummary(cache: Cache) {
  const races = Object.values(cache.processedRaces)

  if (races.length === 0) {
    return { totalRaces: 0, strategies: [], tierDistribution: {}, races: [] }
  }

  races.sort((a, b) => a.date.localeCompare(b.date))

  // Aggregate per strategy
  const strategyAggs = STRATEGIES.map(strat => {
    let totalCost = 0
    let totalPayout = 0
    let hits = 0
    let totalCombos = 0
    let racesWithCombos = 0

    for (const race of races) {
      const s = race.strategies.find(rs => rs.name === strat.name)
      if (!s || s.combos === 0) continue

      racesWithCombos++
      totalCost += s.cost
      totalPayout += s.payout
      totalCombos += s.combos
      if (s.hit) hits++
    }

    return {
      name: strat.name,
      tiers: strat.tiers,
      totalRaces: racesWithCombos,
      totalCost,
      totalPayout,
      hits,
      hitRate: racesWithCombos > 0 ? hits / racesWithCombos : 0,
      roi: totalCost > 0 ? (totalPayout - totalCost) / totalCost : 0,
      avgCombosPerRace:
        racesWithCombos > 0 ? totalCombos / racesWithCombos : 0,
    }
  })

  // Tier distribution: how often does each tier's combo actually win?
  const tierDist: Record<string, number> = {
    recommended: 0,
    promising: 0,
    solid: 0,
    longshot: 0,
    avoid: 0,
    unknown: 0,
  }
  for (const race of races) {
    if (race.winningComboTier) {
      tierDist[race.winningComboTier]++
    } else {
      tierDist['unknown']++
    }
  }

  return {
    totalRaces: races.length,
    dateRange: {
      from: races[0].date,
      to: races[races.length - 1].date,
    },
    generatedAt: new Date().toISOString(),
    strategies: strategyAggs,
    tierDistribution: tierDist,
    races,
  }
}

// ===================== Main =====================

async function main() {
  console.log('=== 3連複バックテスト ===')
  console.log(`期間: 過去${DAYS_BACK}日間`)
  console.log(`テストモード: ${TEST_MODE}`)
  console.log('')

  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true })
  }

  const cache = loadCache()
  const dates = generateDates(DAYS_BACK)

  console.log(`対象日数: ${dates.length}日`)
  console.log(
    `キャッシュ済み: ${Object.keys(cache.processedRaces).length} レース`
  )
  console.log('')

  let totalProcessed = 0
  let totalSkipped = 0
  let totalErrors = 0

  for (const dateStr of dates) {
    if (cache.processedDates.includes(dateStr)) {
      continue
    }

    console.log(`\n${dateStr}...`)
    await sleep(DELAY_MS)

    let races: RaceInfo[]
    try {
      races = await getRacesForDate(dateStr)
    } catch (e) {
      console.error(`  Failed to fetch date ${dateStr}: ${e}`)
      totalErrors++
      continue
    }

    if (races.length === 0) {
      console.log('  No races')
      cache.processedDates.push(dateStr)
      saveCache(cache)
      continue
    }

    console.log(`  ${races.length} races found`)

    for (const race of races) {
      if (cache.processedRaces[race.raceId]) {
        totalSkipped++
        continue
      }

      try {
        // Fetch odds
        await sleep(DELAY_MS)
        const odds = await getOdds(race.url)
        if (odds.length === 0) {
          console.log(
            `  SKIP ${race.venue}${race.raceNumber}R: no odds`
          )
          totalSkipped++
          continue
        }

        // Fetch results
        await sleep(DELAY_MS)
        const results = await getResults(race.url)
        if (results.top3.length < 3) {
          console.log(
            `  SKIP ${race.venue}${race.raceNumber}R: no results`
          )
          totalSkipped++
          continue
        }
        if (results.trifectaPayout <= 0) {
          console.log(
            `  SKIP ${race.venue}${race.raceNumber}R: no trifecta payout`
          )
          totalSkipped++
          continue
        }

        // Process
        const result = processRace(race, dateStr, odds, results)
        if (!result) {
          console.log(
            `  SKIP ${race.venue}${race.raceNumber}R: calculation failed`
          )
          totalSkipped++
          continue
        }

        cache.processedRaces[race.raceId] = result
        totalProcessed++

        // Log
        const hitStrats = result.strategies
          .filter(s => s.hit)
          .map(s => s.name)
        const hitStr =
          hitStrats.length > 0 ? `HIT [${hitStrats.join(', ')}]` : 'MISS'
        console.log(
          `  ${race.venue}${race.raceNumber}R ${race.name}: ${result.trifectaCombo.join('-')} = ${result.trifectaPayout}yen [${result.winningComboTier || '?'}] ${hitStr}`
        )

        saveCache(cache)

        if (TEST_MODE && totalProcessed >= 1) {
          console.log('\nTest mode: 1 race processed')
          break
        }
      } catch (e) {
        console.error(`  ERROR ${race.venue}${race.raceNumber}R: ${e}`)
        totalErrors++
      }
    }

    if (TEST_MODE && totalProcessed >= 1) break

    cache.processedDates.push(dateStr)
    saveCache(cache)
  }

  // === Summary ===
  console.log('\n\n=== Summary ===')
  console.log(`Processed: ${totalProcessed} races`)
  console.log(`Skipped: ${totalSkipped} races`)
  console.log(`Errors: ${totalErrors} races`)
  console.log(
    `Total cached: ${Object.keys(cache.processedRaces).length} races`
  )

  const summary = generateSummary(cache)
  writeFileSync(OUTPUT_FILE, JSON.stringify(summary, null, 2), 'utf-8')
  console.log(`\nResults saved to ${OUTPUT_FILE}`)

  // Also copy to public/data/ for the web UI
  const PUBLIC_DATA_DIR = join(PROJECT_ROOT, 'public', 'data')
  if (!existsSync(PUBLIC_DATA_DIR)) {
    mkdirSync(PUBLIC_DATA_DIR, { recursive: true })
  }
  const PUBLIC_OUTPUT = join(PUBLIC_DATA_DIR, 'backtest-results.json')
  writeFileSync(PUBLIC_OUTPUT, JSON.stringify(summary, null, 2), 'utf-8')
  console.log(`Results also saved to ${PUBLIC_OUTPUT}`)

  // Print strategy results
  console.log('\n=== Strategy Performance ===')
  for (const s of summary.strategies) {
    console.log(`\n${s.name} (${s.tiers.join('+')})`)
    console.log(`  Races: ${s.totalRaces}`)
    console.log(
      `  Hits: ${s.hits} / ${s.totalRaces} = ${(s.hitRate * 100).toFixed(1)}%`
    )
    console.log(`  Investment: ${s.totalCost.toLocaleString()} yen`)
    console.log(`  Return: ${s.totalPayout.toLocaleString()} yen`)
    console.log(`  ROI: ${(s.roi * 100).toFixed(1)}%`)
    console.log(`  Avg combos/race: ${s.avgCombosPerRace.toFixed(1)}`)
  }

  // Tier distribution
  console.log('\n=== Winning Combo Tier Distribution ===')
  const total = Object.keys(cache.processedRaces).length
  for (const [tier, count] of Object.entries(summary.tierDistribution)) {
    if ((count as number) > 0) {
      console.log(
        `  ${tier}: ${count} (${(((count as number) / total) * 100).toFixed(1)}%)`
      )
    }
  }
}

main().catch(console.error)
