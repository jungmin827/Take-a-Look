import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { getAllEssays } from '@/lib/essays-db'
import { verifyAdmin } from '@/lib/admin-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const essays = await getAllEssays()
    return res.status(200).json(essays)
  }

  if (req.method === 'POST') {
    if (!verifyAdmin(req)) return res.status(401).json({ error: 'Unauthorized' })

    const { slug, title, excerpt, coverImage, alt, content, date, readingTime, published, tags } = req.body

    if (!slug || !title || !content) {
      return res.status(400).json({ error: 'slug, title, content는 필수입니다.' })
    }

    try {
      const essay = await prisma.essay.create({
        data: {
          slug,
          title,
          excerpt: excerpt ?? '',
          coverImage: coverImage ?? '',
          alt: alt ?? '',
          content: typeof content === 'string' ? content : JSON.stringify(content),
          date: date ? new Date(date) : new Date(),
          readingTime: readingTime ?? '3분',
          published: published ?? false,
          tags: {
            create: (tags ?? []).map((name: string) => ({
              tag: { connectOrCreate: { where: { name }, create: { name } } },
            })),
          },
        },
      })
      return res.status(201).json(essay)
    } catch (err: any) {
      if (err?.code === 'P2002') {
        return res.status(409).json({ error: '이미 존재하는 slug입니다.' })
      }
      console.error(err)
      return res.status(500).json({ error: '글 생성에 실패했습니다.' })
    }
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end()
}
