import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env') })
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import * as fs from 'fs'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const dbPath = path.join(process.cwd(), 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: dbPath })
const prisma = new PrismaClient({ adapter })

interface MaterialInput {
  title: string
  excerpt?: string
  body: string
  tags?: string[]
  coverImage?: string
  alt?: string
  date?: string
  published?: boolean
}

function slugify(title: string): string {
  const map: Record<string, string> = {
    힙합: 'hiphop', 음악: 'music', 독서: 'reading', 책: 'book',
    전시: 'exhibit', 미술: 'art', 개발: 'dev', 영화: 'film',
    여행: 'travel', 음식: 'food', 사진: 'photo', 일상: 'daily',
  }
  let base = title
  for (const [k, v] of Object.entries(map)) base = base.split(k).join(v)
  const clean = base
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  const suffix = Date.now().toString(36)
  return `${clean}-${suffix}`.slice(0, 60)
}

function estimateReadingTime(text: string): string {
  const minutes = Math.max(3, Math.round(text.length / 500))
  return `${minutes}분`
}

function bodyToTiptap(body: string): string {
  const lines = body.split('\n')
  const nodes: any[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i].trim()

    if (!line) {
      i++
      continue
    }

    // ## heading
    if (line.startsWith('## ')) {
      nodes.push({
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: line.slice(3).trim() }],
      })
      i++
      continue
    }

    // # heading
    if (line.startsWith('# ')) {
      nodes.push({
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: line.slice(2).trim() }],
      })
      i++
      continue
    }

    // paragraph — collect consecutive non-blank, non-heading lines
    const paraLines: string[] = []
    while (i < lines.length && lines[i].trim() && !lines[i].trim().startsWith('#')) {
      paraLines.push(lines[i].trim())
      i++
    }
    if (paraLines.length > 0) {
      nodes.push({
        type: 'paragraph',
        content: [{ type: 'text', text: paraLines.join(' ') }],
      })
    }
  }

  return JSON.stringify({ type: 'doc', content: nodes })
}

async function main() {
  const inputArg = process.argv[2]
  const inputPath = inputArg
    ? path.resolve(process.cwd(), inputArg)
    : path.join(process.cwd(), 'scripts', 'my-materials.json')

  if (!fs.existsSync(inputPath)) {
    console.error(`파일 없음: ${inputPath}`)
    console.error('사용법: npm run import [파일경로]')
    console.error('예시:   npm run import scripts/my-materials.json')
    process.exit(1)
  }

  const materials: MaterialInput[] = JSON.parse(fs.readFileSync(inputPath, 'utf-8'))
  console.log(`${materials.length}개 자료 → DB 등록 시작\n`)

  let inserted = 0
  let skipped = 0

  for (const mat of materials) {
    if (!mat.title || !mat.body) {
      console.warn(`  ✗ title/body 누락 — 건너뜀`)
      skipped++
      continue
    }

    const slug = slugify(mat.title)
    const content = bodyToTiptap(mat.body)
    const readingTime = estimateReadingTime(mat.body)
    const tags = mat.tags ?? []

    try {
      const essay = await prisma.essay.create({
        data: {
          slug,
          title: mat.title,
          excerpt: mat.excerpt ?? '',
          coverImage: mat.coverImage ?? '',
          alt: mat.alt ?? '',
          content,
          date: mat.date ? new Date(mat.date) : new Date(),
          readingTime,
          published: mat.published ?? false,
          tags: {
            create: tags.map((name: string) => ({
              tag: { connectOrCreate: { where: { name }, create: { name } } },
            })),
          },
        },
      })
      console.log(`  ✓ [${essay.slug}] "${essay.title}"`)
      inserted++

      // 임베딩 생성 (non-fatal)
      try {
        const { generateChunkEmbeddings } = await import('../lib/embedding')
        const { upsertEssayEmbeddings } = await import('../lib/supabase-vector')
        const chunks = await generateChunkEmbeddings(essay.content)
        await upsertEssayEmbeddings(essay.id, chunks)
        console.log(`     └─ 임베딩 완료`)
      } catch {
        console.warn(`     └─ 임베딩 실패 (글 등록은 성공)`)
      }
    } catch (e: any) {
      if (e?.code === 'P2002') {
        console.warn(`  ✗ [${slug}] slug 중복 — 건너뜀`)
      } else {
        console.warn(`  ✗ "${mat.title}" 실패: ${e.message}`)
      }
      skipped++
    }
  }

  console.log(`\n완료: ${inserted}개 등록, ${skipped}개 건너뜀`)

  const count = await prisma.essay.count()
  console.log(`DB 총 에세이: ${count}개`)
}

main()
  .catch(e => {
    console.error('실패:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
