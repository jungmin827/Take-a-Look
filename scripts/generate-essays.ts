import 'dotenv/config'
import Anthropic from '@anthropic-ai/sdk'
import * as fs from 'fs'
import * as path from 'path'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const DELAY_MS = 1000

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

interface GeneratedEssay {
  slug: string
  title: string
  excerpt: string
  content: string // Tiptap JSON string
  date: string
  readingTime: string
  tags: string[]
  coverImage: string
  alt: string
  published: boolean
}

function slugify(text: string, no: string): string {
  const map: Record<string, string> = {
    힙합: 'hiphop', 음악: 'music', 독서: 'reading', 책: 'book',
    전시: 'exhibit', 미술: 'art', IT: 'it', 개발: 'dev',
    애니: 'anime', 일본: 'japan', 영화: 'film',
  }
  const base = Object.keys(map).reduce((acc, k) => acc.replace(k, map[k]), text)
  const clean = base.toLowerCase().replace(/[^a-z0-9가-힣]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
  return `${clean}-${no}`.slice(0, 60)
}

function estimateReadingTime(text: string): string {
  const chars = text.length
  const minutes = Math.max(3, Math.round(chars / 500))
  return `${minutes}분`
}

function buildTiptapDoc(sections: { heading: string; body: string }[]): string {
  const content: any[] = []

  for (const sec of sections) {
    if (sec.heading) {
      content.push({
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: sec.heading }],
      })
    }
    for (const para of sec.body.split('\n').filter(p => p.trim())) {
      content.push({
        type: 'paragraph',
        content: [{ type: 'text', text: para.trim() }],
      })
    }
  }

  return JSON.stringify({ type: 'doc', content })
}

async function generateEssay(post: CrawledPost): Promise<GeneratedEssay | null> {
  const systemPrompt = `당신은 "비주류" 취향 에세이 플랫폼의 필자입니다.
디시인사이드 커뮤니티 글을 참고하여, "왜 나는 이것을 파게 됐는가" 형식의 개인 취향 에세이를 작성합니다.

규칙:
- 1인칭 시점, 자연스러운 한국어 에세이 문체
- 3-4개 섹션 (각 섹션에 ## 소제목 포함)
- 전체 600-900자
- 커뮤니티 말투, 이모티콘, 광고성 내용 완전 제거
- 독자가 공감할 수 있는 구체적인 경험과 감정 포함
- 마지막에 반드시 아래 JSON 형식으로만 응답:

{
  "title": "에세이 제목 (30자 이내)",
  "excerpt": "한 줄 요약 (80자 이내, 클릭 유도)",
  "readingTime": "X분",
  "sections": [
    { "heading": "소제목", "body": "단락 내용\n두 번째 줄" },
    ...
  ]
}`

  const userPrompt = `갤러리: ${post.galleryName}
원문 제목: ${post.title}
원문 내용:
${post.body.slice(0, 2000)}`

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    })

    const raw = (message.content[0] as any).text as string

    // JSON 추출
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.warn(`  JSON 파싱 실패: ${post.no}`)
      return null
    }

    const parsed = JSON.parse(jsonMatch[0])
    const { title, excerpt, readingTime, sections } = parsed

    if (!title || !excerpt || !sections?.length) return null

    const contentStr = buildTiptapDoc(sections)
    const slug = slugify(post.tags[0] || post.galleryName, post.no)
    const coverImage = post.images[0] || `/images/placeholder-${post.gallery}.jpg`

    return {
      slug,
      title,
      excerpt,
      content: contentStr,
      date: new Date().toISOString(),
      readingTime: readingTime || estimateReadingTime(contentStr),
      tags: post.tags,
      coverImage,
      alt: `${post.galleryName} 관련 이미지`,
      published: true,
    }
  } catch (e: any) {
    console.warn(`  생성 실패 [${post.no}]: ${e.message}`)
    return null
  }
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
  const inputPath = path.join(process.cwd(), 'scripts', 'crawled-data.json')
  if (!fs.existsSync(inputPath)) {
    console.error('crawled-data.json 없음. 먼저 npm run crawl 실행하세요.')
    process.exit(1)
  }

  const posts: CrawledPost[] = JSON.parse(fs.readFileSync(inputPath, 'utf-8'))
  console.log(`총 ${posts.length}개 포스트 → 에세이 변환 시작\n`)

  const essays: GeneratedEssay[] = []

  for (const post of posts) {
    process.stdout.write(`[${post.galleryName}] "${post.title.slice(0, 25)}"... `)
    const essay = await generateEssay(post)
    if (essay) {
      essays.push(essay)
      console.log(`✓ "${essay.title}"`)
    } else {
      console.log('✗ 건너뜀')
    }
    await sleep(DELAY_MS)
  }

  const outputPath = path.join(process.cwd(), 'scripts', 'generated-essays.json')
  fs.writeFileSync(outputPath, JSON.stringify(essays, null, 2), 'utf-8')

  console.log(`\n완료: ${essays.length}개 에세이 생성 → ${outputPath}`)
}

main().catch(e => {
  console.error('생성 실패:', e)
  process.exit(1)
})
