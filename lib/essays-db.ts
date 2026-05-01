import { prisma } from './db'
import type { Essay } from '@/types'

function toEssay(raw: any): Essay {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    excerpt: raw.excerpt,
    coverImage: raw.coverImage,
    alt: raw.alt,
    content: raw.content,
    date: raw.date.toISOString(),
    readingTime: raw.readingTime,
    published: raw.published,
    tags: raw.tags?.map((t: any) => t.tag.name) ?? [],
  }
}

export async function getAllEssays(includeUnpublished = false): Promise<Essay[]> {
  const rows = await prisma.essay.findMany({
    where: includeUnpublished ? {} : { published: true },
    include: { tags: { include: { tag: true } } },
    orderBy: { date: 'desc' },
  })
  return rows.map(toEssay)
}

export async function getEssayBySlug(slug: string): Promise<Essay | null> {
  const row = await prisma.essay.findUnique({
    where: { slug },
    include: { tags: { include: { tag: true } } },
  })
  return row ? toEssay(row) : null
}

export async function getRelatedEssays(slug: string, limit = 10): Promise<Essay[]> {
  const essay = await prisma.essay.findUnique({
    where: { slug },
    include: { tags: { include: { tag: true } } },
  })
  if (!essay) return []

  const tagIds = essay.tags.map(t => t.tagId)
  if (tagIds.length === 0) return []

  const rows = await prisma.essay.findMany({
    where: {
      published: true,
      slug: { not: slug },
      tags: { some: { tagId: { in: tagIds } } },
    },
    include: { tags: { include: { tag: true } } },
    orderBy: { date: 'desc' },
    take: limit * 3,
  })

  const scored = rows.map(r => ({
    row: r,
    score: r.tags.filter(t => tagIds.includes(t.tagId)).length,
  }))
  scored.sort((a, b) => b.score - a.score || b.row.date.getTime() - a.row.date.getTime())

  return scored.slice(0, limit).map(s => toEssay(s.row))
}

export async function getAllSlugs(): Promise<string[]> {
  const rows = await prisma.essay.findMany({
    where: { published: true },
    select: { slug: true },
  })
  return rows.map(r => r.slug)
}
