import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { verifyAdmin } from '@/lib/admin-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!verifyAdmin(req)) return res.status(401).json({ error: 'Unauthorized' })

  const { id } = req.query as { id: string }

  if (req.method === 'PATCH') {
    const { title, excerpt, coverImage, alt, content, date, readingTime, published, tags } = req.body

    try {
      if (tags !== undefined) {
        await prisma.tagsOnEssays.deleteMany({ where: { essayId: id } })
      }

      const essay = await prisma.essay.update({
        where: { id },
        data: {
          ...(title !== undefined && { title }),
          ...(excerpt !== undefined && { excerpt }),
          ...(coverImage !== undefined && { coverImage }),
          ...(alt !== undefined && { alt }),
          ...(content !== undefined && {
            content: typeof content === 'string' ? content : JSON.stringify(content),
          }),
          ...(date !== undefined && { date: new Date(date) }),
          ...(readingTime !== undefined && { readingTime }),
          ...(published !== undefined && { published }),
          ...(tags !== undefined && {
            tags: {
              create: tags.map((name: string) => ({
                tag: { connectOrCreate: { where: { name }, create: { name } } },
              })),
            },
          }),
        },
      })
      return res.status(200).json(essay)
    } catch (err: any) {
      if (err?.code === 'P2025') {
        return res.status(404).json({ error: '글을 찾을 수 없습니다.' })
      }
      console.error(err)
      return res.status(500).json({ error: '글 수정에 실패했습니다.' })
    }
  }

  if (req.method === 'DELETE') {
    try {
      await prisma.essay.delete({ where: { id } })
      return res.status(204).end()
    } catch (err: any) {
      if (err?.code === 'P2025') {
        return res.status(404).json({ error: '글을 찾을 수 없습니다.' })
      }
      console.error(err)
      return res.status(500).json({ error: '글 삭제에 실패했습니다.' })
    }
  }

  res.setHeader('Allow', ['PATCH', 'DELETE'])
  res.status(405).end()
}
