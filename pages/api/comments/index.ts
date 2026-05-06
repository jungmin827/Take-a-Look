import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/db'
import { getComments } from '@/lib/comments-db'
import { rateLimit } from '@/lib/rate-limit'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const essayId = req.query.essayId as string
    if (!essayId) return res.status(400).json({ error: 'essayId가 필요합니다.' })
    const comments = await getComments(essayId)
    return res.status(200).json(comments)
  }

  if (req.method === 'POST') {
    const supabase = createSupabaseServerClient(req, res)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return res.status(401).json({ error: '로그인이 필요합니다.' })
    }

    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ??
      req.socket.remoteAddress ??
      'unknown'

    if (!rateLimit(ip, 5, 60_000)) {
      return res.status(429).json({ error: '잠시 후 다시 시도해주세요.' })
    }

    const { essayId, body, parentId } = req.body
    const authorName = user.email?.split('@')[0] ?? '익명'

    if (!essayId || !body) {
      return res.status(400).json({ error: 'essayId, body는 필수입니다.' })
    }
    if (body.length < 5) {
      return res.status(400).json({ error: '댓글은 5자 이상이어야 합니다.' })
    }
    if (body.length > 500) {
      return res.status(400).json({ error: '댓글은 500자 이하여야 합니다.' })
    }

    const comment = await prisma.comment.create({
      data: { essayId, authorName, body, parentId: parentId ?? null, userId: user.id },
    })

    return res.status(201).json({
      ...comment,
      createdAt: comment.createdAt.toISOString(),
    })
  }

  res.setHeader('Allow', ['GET', 'POST'])
  res.status(405).end()
}
