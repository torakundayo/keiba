import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const response = await fetch('https://www.keibalab.jp/db/race/grade.html')

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
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

    $('div.raceTableWrap table.DbTable tr.dispRow').each((index, tr) => {
      if (upcomingRaces.length >= 3) return false

      const dateText = $(tr).find('td:first-child').text().trim()
      const dateMatch = dateText.match(/(\d{1,2})月(\d{1,2})日/)
      if (!dateMatch) return

      const month = parseInt(dateMatch[1], 10)
      const day = parseInt(dateMatch[2], 10)

      const raceDate = month * 100 + day
      const today = currentMonth * 100 + currentDay

      if (raceDate >= today) {
        const boldTd = $(tr).find('td.bold')
        const link = boldTd.find('a')
        const raceName = link.length > 0 ? link.text().trim() : ''
        const baseUrl = link.attr('href')

        if (raceName && baseUrl) {
          // baseUrl is like /db/race/202602150511/ — already ends with /
          const raceUrl = `https://www.keibalab.jp${baseUrl}odds.html`
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

    return NextResponse.json(
      { races: upcomingRaces },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600'
        }
      }
    )
  } catch (error) {
    console.error('Error fetching races:', error)
    return NextResponse.json(
      { error: 'Failed to fetch race data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
