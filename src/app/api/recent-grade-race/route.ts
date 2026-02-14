import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const dateParam = request.nextUrl.searchParams.get('date')
    const fetchUrl = dateParam
      ? `https://www.keibalab.jp/db/race/${dateParam}/`
      : 'https://www.keibalab.jp/db/race/'

    const response = await fetch(fetchUrl)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // ページタイトルから日付を取得（例: "2026年2月15日のレース一覧"）
    const pageTitle = $('title').text()
    const titleDateMatch = pageTitle.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
    let pageDate = ''
    if (titleDateMatch) {
      const [, year, month, day] = titleDateMatch
      pageDate = `${year}/${month.padStart(2, '0')}/${day.padStart(2, '0')}`
    }

    // 開催日程のリンクを取得
    interface RaceDate {
      id: string    // YYYYMMDD
      label: string // "2月15日"
      selected: boolean
    }

    const dates: RaceDate[] = []
    $('ul.option-set.filters li a[href^="/db/race/"]').each((_, el) => {
      const href = $(el).attr('href') || ''
      const dateIdMatch = href.match(/\/db\/race\/(\d{8})\//)
      if (!dateIdMatch) return
      const label = $(el).text().trim()
      const selected = $(el).hasClass('selected')
      dates.push({ id: dateIdMatch[1], label, selected })
    })

    interface Race {
      name: string
      url: string
      date: string
      venue: string
      raceNumber: number
      time: string
    }

    const races: Race[] = []

    // 各会場テーブルを処理
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
        const time = raceNumTd.find('span').text().trim()

        const infoTd = $(tr).find('td').eq(1)
        const nameLink = infoTd.find('a').first()
        const raceName = nameLink.text().trim()
        const baseUrl = nameLink.attr('href')

        if (!raceName || !baseUrl) return

        const raceUrl = `https://www.keibalab.jp${baseUrl}odds.html`

        races.push({
          name: raceName,
          url: raceUrl,
          date: pageDate,
          venue,
          raceNumber,
          time,
        })
      })
    })

    if (races.length === 0 && dates.length === 0) {
      return NextResponse.json(
        { error: 'No races found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { races, dates },
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
