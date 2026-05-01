import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const dbPath = path.join(process.cwd(), 'dev.db')
const adapter = new PrismaBetterSqlite3({ url: dbPath })
const prisma = new PrismaClient({ adapter })
const contentDir = path.join(process.cwd(), 'content')

async function main() {
  if (!fs.existsSync(contentDir)) {
    console.log('content/ 없음. 시드 스킵.')
    return
  }

  const files = fs.readdirSync(contentDir).filter(f => f.endsWith('.mdx'))

  if (files.length === 0) {
    console.log('MDX 파일 없음. 시드 스킵.')
    return
  }

  for (const file of files) {
    const raw = fs.readFileSync(path.join(contentDir, file), 'utf-8')
    const { data, content } = matter(raw)

    const tiptapDoc = JSON.stringify({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: content.trim() }] },
      ],
    })

    const tags: string[] = data.tags ?? []

    await prisma.essay.upsert({
      where: { slug: data.slug },
      create: {
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt ?? '',
        coverImage: data.coverImage ?? '',
        alt: data.alt ?? '',
        content: tiptapDoc,
        date: new Date(data.date),
        readingTime: data.readingTime ?? '3분',
        published: true,
        tags: {
          create: tags.map(name => ({
            tag: { connectOrCreate: { where: { name }, create: { name } } },
          })),
        },
      },
      update: {},
    })

    console.log(`Seeded: ${data.slug}`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
