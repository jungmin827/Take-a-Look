import * as fs from 'fs'
import * as path from 'path'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const dbPath = path.join(process.cwd(), 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: dbPath })
const prisma = new PrismaClient({ adapter })

interface GeneratedEssay {
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  readingTime: string
  tags: string[]
  coverImage: string
  alt: string
  published: boolean
}

async function main() {
  const inputPath = path.join(process.cwd(), 'scripts', 'generated-essays.json')
  if (!fs.existsSync(inputPath)) {
    console.error('generated-essays.json 없음. 먼저 npm run generate 실행하세요.')
    process.exit(1)
  }

  const essays: GeneratedEssay[] = JSON.parse(fs.readFileSync(inputPath, 'utf-8'))
  console.log(`${essays.length}개 에세이 → DB seed 시작\n`)

  let inserted = 0
  let skipped = 0

  for (const essay of essays) {
    try {
      await prisma.essay.upsert({
        where: { slug: essay.slug },
        create: {
          slug: essay.slug,
          title: essay.title,
          excerpt: essay.excerpt,
          coverImage: essay.coverImage,
          alt: essay.alt,
          content: essay.content,
          date: new Date(essay.date),
          readingTime: essay.readingTime,
          published: essay.published,
          tags: {
            create: essay.tags.map(name => ({
              tag: {
                connectOrCreate: { where: { name }, create: { name } },
              },
            })),
          },
        },
        update: {
          title: essay.title,
          excerpt: essay.excerpt,
          content: essay.content,
          readingTime: essay.readingTime,
          published: essay.published,
        },
      })
      console.log(`  ✓ [${essay.slug}] "${essay.title}"`)
      inserted++
    } catch (e: any) {
      console.warn(`  ✗ [${essay.slug}] 실패: ${e.message}`)
      skipped++
    }
  }

  console.log(`\n완료: ${inserted}개 삽입, ${skipped}개 실패`)

  const count = await prisma.essay.count()
  console.log(`DB 총 에세이: ${count}개`)
}

main()
  .catch(e => {
    console.error('Seed 실패:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
