import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { url: string } }
) {
  try {
    const decodedUrl = decodeURIComponent(params.url)
    const cleanUrl = decodedUrl.replace(/([^:]\/)\/+/g, '$1')

    const response = await fetch(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    })

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    const horseOdds: { name: string; odds: number }[] = []

    for (let i = 1; i <= 18; i++) {
      const row = $(`#top > table > tbody > tr:nth-child(${i})`)
      const horseName = row.find('td.bameiBox.noWrap > dl > dd.bamei3 > a').text().trim()
      const oddsText = row.find('td.umaboddsBox > dl > dd:nth-child(2) > i').text().trim()

      if (horseName) {
        const odds = oddsText ? parseFloat(oddsText) : 1.0
        horseOdds.push({
          name: horseName,
          odds: isNaN(odds) ? 1.0 : odds
        })
      }
    }

    if (horseOdds.length === 0) {
      throw new Error('No horses found')
    }

    return NextResponse.json(horseOdds, {
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800'
      }
    })
  } catch (error) {
    console.error('Error fetching odds:', error)
    return NextResponse.json(
      { error: 'Failed to fetch odds data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
