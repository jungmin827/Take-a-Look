import axios from 'axios'
import * as cheerio from 'cheerio'
import * as fs from 'fs'
import * as path from 'path'

const DELAY_MS = 1500

const GALLERIES = [
  { id: 'hiphop', name: '힙합', tags: ['힙합', '음악'] },
  { id: 'book', name: '독서', tags: ['독서', '책'] },
  { id: 'exhibit', name: '전시', tags: ['전시', '미술'] },
  { id: 'programming', name: 'IT', tags: ['IT', '개발'] },
  { id: 'anime', name: '애니', tags: ['애니', '일본'] },
  { id: 'movie', name: '영화', tags: ['영화'] },
]

const POSTS_PER_GALLERY = 5

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ko-KR,ko;q=0.9',
  'Referer': 'https://gall.dcinside.com/',
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function fetchListPage(galleryId: string): Promise<{ no: string; title: string }[]> {
  const url = `https://gall.dcinside.com/board/lists/?id=${galleryId}&sort_type=N&search_head=&list_num=50`
  const res = await axios.get(url, { headers: HEADERS, timeout: 10000 })
  const $ = cheerio.load(res.data)

  const posts: { no: string; title: string }[] = []

  $('tr.ub-content').each((_, el) => {
    const no = $(el).find('td.gall_num').text().trim()
    const titleEl = $(el).find('td.gall_tit a').first()
    const title = titleEl.text().trim()

    // 공지, 설문, 이미지글 제외 / 일반 텍스트 글만
    const isNotice = $(el).hasClass('notice_img') || $(el).find('em.icon_notice').length > 0
    const isAdminPost = no === '' || isNaN(Number(no))

    if (!isNotice && !isAdminPost && title) {
      posts.push({ no, title })
    }
  })

  return posts.slice(0, POSTS_PER_GALLERY * 3) // 여유분 확보
}

async function fetchPostBody(galleryId: string, no: string): Promise<{ body: string; images: string[] } | null> {
  const url = `https://gall.dcinside.com/board/view/?id=${galleryId}&no=${no}`
  try {
    const res = await axios.get(url, { headers: { ...HEADERS, Referer: `https://gall.dcinside.com/board/lists/?id=${galleryId}` }, timeout: 10000 })
    const $ = cheerio.load(res.data)

    const contentEl = $('.write_div')

    // 이미지 URL 수집
    const images: string[] = []
    contentEl.find('img').each((_, img) => {
      const src = $(img).attr('src') || $(img).attr('data-src') || ''
      if (src && src.startsWith('http') && !src.includes('dcinside.com/skin')) {
        images.push(src)
      }
    })

    // 텍스트 추출 (광고 제거)
    contentEl.find('script, style, .adsbygoogle, iframe').remove()
    const body = contentEl.text().replace(/\s+/g, ' ').trim()

    if (body.length < 100) return null // 너무 짧은 글 제외

    return { body, images }
  } catch {
    return null
  }
}

interface CrawledPost {
  gallery: string
  galleryName: string
  no: string
  title: string
  body: string
  tags: string[]
  images: string[]
  sourceUrl: string
}

async function crawlGallery(gallery: typeof GALLERIES[0]): Promise<CrawledPost[]> {
  console.log(`\n[${gallery.name}] 갤러리 크롤링 시작...`)

  let listItems: { no: string; title: string }[] = []
  try {
    listItems = await fetchListPage(gallery.id)
    console.log(`  목록 ${listItems.length}개 수집`)
  } catch (e: any) {
    console.warn(`  목록 수집 실패: ${e.message}`)
    return []
  }

  const results: CrawledPost[] = []

  for (const item of listItems) {
    if (results.length >= POSTS_PER_GALLERY) break

    await sleep(DELAY_MS)

    const post = await fetchPostBody(gallery.id, item.no)
    if (!post) {
      console.log(`  [${item.no}] 건너뜀 (본문 없음)`)
      continue
    }

    results.push({
      gallery: gallery.id,
      galleryName: gallery.name,
      no: item.no,
      title: item.title,
      body: post.body.slice(0, 3000), // 최대 3000자
      tags: gallery.tags,
      images: post.images.slice(0, 3),
      sourceUrl: `https://gall.dcinside.com/board/view/?id=${gallery.id}&no=${item.no}`,
    })

    console.log(`  [${item.no}] "${item.title.slice(0, 30)}" — ${post.body.length}자`)
  }

  console.log(`  → ${results.length}개 수집 완료`)
  return results
}

async function main() {
  const allPosts: CrawledPost[] = []

  for (const gallery of GALLERIES) {
    const posts = await crawlGallery(gallery)
    allPosts.push(...posts)
    await sleep(DELAY_MS * 2)
  }

  const outputPath = path.join(process.cwd(), 'scripts', 'crawled-data.json')
  fs.writeFileSync(outputPath, JSON.stringify(allPosts, null, 2), 'utf-8')

  console.log(`\n완료: 총 ${allPosts.length}개 포스트 → ${outputPath}`)
}

main().catch(e => {
  console.error('크롤링 실패:', e)
  process.exit(1)
})
