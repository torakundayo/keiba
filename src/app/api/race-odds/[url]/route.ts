import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { getCache, setCache } from '@/lib/redis'

// このルートは動的であることを明示
export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { url: string } }
) {
  try {
    // URLをキーとしてキャッシュをチェック
    const cacheKey = `odds-${encodeURIComponent(params.url)}`
    const cached = await getCache(cacheKey)
    if (cached) {
      console.log('🚀 Using cached odds data')
      return NextResponse.json(cached)
    }

    console.log('🔄 Fetching fresh odds data from web...')
    // URLデコード
    const decodedUrl = decodeURIComponent(params.url)
    const cleanUrl = decodedUrl.replace(/([^:]\/)\/+/g, '$1')

    // リクエストを送信
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

    // 1から18まで各行を処理
    for (let i = 1; i <= 18; i++) {
      const row = $(`#top > table > tbody > tr:nth-child(${i})`)
      const horseName = row.find('td.bameiBox.noWrap > dl > dd.bamei3 > a').text().trim()
      const oddsText = row.find('td.umaboddsBox > dl > dd:nth-child(2) > i').text().trim()

      // 馬名があれば、オッズの有無に関わらず配列に追加
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

    // キャッシュに保存（オッズは頻繁に変更される可能性があるため、15分でキャッシュを期限切れに）
    await setCache(cacheKey, horseOdds, 900) // 900秒 = 15分
    console.log('💾 Odds data cached successfully')

    return NextResponse.json(horseOdds)
  } catch (error) {
    console.error('Error fetching odds:', error)
    return NextResponse.json(
      { error: 'Failed to fetch odds data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}