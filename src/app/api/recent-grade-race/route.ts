import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { getCache, setCache } from '@/lib/redis'

export async function GET() {
  try {
    // キャッシュをチェック
    const cached = await getCache('recent-races')
    if (cached) {
      console.log('🚀 Using cached race data')
      return NextResponse.json(cached)
    }

    console.log('🔄 Fetching fresh race data from web...')
    // 競馬ラボの重賞レーススケジュールページにアクセス
    const response = await fetch('https://www.keibalab.jp/db/race/grade.html')

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()

    // cheerioでHTMLをパース
    const $ = cheerio.load(html)

    // 今日の日付を取得（日本時間）
    const now = new Date()
    const japanTime = new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(now)
    const [currentYear, currentMonth, currentDay] = japanTime.split('/').map(Number)

    interface Race {
      name: string
      url: string
      date: string
    }

    let upcomingRaces: Race[] = []

    // テーブルの各行を走査
    $('#mainWrap > div > div > div.raceTableWrap > table > tbody > tr').each((index, tr) => {
      if (upcomingRaces.length >= 3) return false

      const dateText = $(tr).find('td:first-child').text().trim()
      const dateMatch = dateText.match(/(\d{1,2})月(\d{1,2})日/)
      if (!dateMatch) return

      const month = parseInt(dateMatch[1], 10)
      const day = parseInt(dateMatch[2], 10)

      // 日付の比較（月日を数値化して比較）
      const raceDate = month * 100 + day
      const today = currentMonth * 100 + currentDay

      if (raceDate >= today) {
        const raceName = $(tr).find('td.bold > a').text().trim()
        const baseUrl = $(tr).find('td.bold > a').attr('href')

        if (raceName && baseUrl) {
          // ベースURLを追加してフルURLを構築
          const raceUrl = `https://www.keibalab.jp${baseUrl}/umabashira.html?kind=yoko`
          const formattedDate = `${currentYear}/${String(month).padStart(2, '0')}/${String(day).padStart(2, '0')}`

          upcomingRaces.push({
            name: raceName,
            url: raceUrl,
            date: formattedDate
          })
        }
      }
    })

    if (upcomingRaces.length === 0) {
      return NextResponse.json(
        { error: 'No upcoming races found' },
        { status: 404 }
      )
    }

    // キャッシュに保存
    await setCache('recent-races', { races: upcomingRaces })
    console.log('💾 Race data cached successfully')

    return NextResponse.json({ races: upcomingRaces }, { status: 200 })
  } catch (error) {
    console.error('Error fetching races:', error)
    return NextResponse.json(
      { error: 'Failed to fetch race data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}