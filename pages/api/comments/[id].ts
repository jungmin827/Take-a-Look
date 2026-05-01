import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { verifyAdmin } from '@/lib/admin-auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE'])
    return res.status(405).end()
  }
  if (!verifyAdmin(req)) return res.status(401).json({ error: 'Unauthorized' })

  const { id } = req.query as { id: string }
  try {
    await prisma.comment.delete({ where: { id } })
    res.status(204).end()
  } catch (err: any) {
    if (err?.code === 'P2025') {
      return res.status(404).json({ error: '댓글을 찾을 수 없습니다.' })
    }
    console.error(err)
    res.status(500).json({ error: '댓글 삭제에 실패했습니다.' })
  }
}
