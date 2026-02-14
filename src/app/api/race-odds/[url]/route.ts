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

    const horseOdds: { name: string; odds: number; placeOddsLow: number; placeOddsHigh: number }[] = []

    // odds.html の #oddsTanTable から単勝・複勝を取得
    // 構造: 枠番 | 馬番 | 馬名 | 単勝 | 複勝低 | - | 複勝高 | 人気
    $('#oddsTanTable tbody tr').each((_, row) => {
      const tds = $(row).find('td')
      if (tds.length < 7) return

      const horseName = $(tds[2]).text().trim()
      const winOddsText = $(tds[3]).find('i').text().trim()
      const placeOddsLowText = $(tds[4]).find('i').text().trim()
      const placeOddsHighText = $(tds[6]).find('i').text().trim()

      if (horseName) {
        const winOdds = parseFloat(winOddsText) || 1.0
        const placeOddsLow = parseFloat(placeOddsLowText) || 0
        const placeOddsHigh = parseFloat(placeOddsHighText) || 0

        horseOdds.push({
          name: horseName,
          odds: winOdds,
          placeOddsLow,
          placeOddsHigh,
        })
      }
    })

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
