import type { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'
import { signAdminToken } from '@/lib/admin-auth'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end()
  }

  const { password } = req.body
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: '비밀번호가 틀렸습니다.' })
  }

  const token = signAdminToken()
  res.setHeader(
    'Set-Cookie',
    serialize('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
  )

  res.status(200).json({ ok: true })
}
