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
  await prisma.comment.delete({ where: { id } })
  res.status(204).end()
}
