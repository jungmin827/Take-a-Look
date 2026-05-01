import type { NextApiRequest, NextApiResponse } from 'next'
import { getRelatedEssays } from '@/lib/essays-db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end()
  }

  const slug = req.query.slug as string
  if (!slug) return res.status(400).json({ error: 'slug 파라미터가 필요합니다.' })

  const essays = await getRelatedEssays(slug)
  res.status(200).json(essays)
}
