import jwt from 'jsonwebtoken'
import type { NextApiRequest } from 'next'

const SECRET = process.env.ADMIN_JWT_SECRET ?? 'dev-secret'
const COOKIE_NAME = 'admin_token'

export function signAdminToken(): string {
  return jwt.sign({ admin: true }, SECRET, { expiresIn: '7d' })
}

export function verifyAdmin(req: NextApiRequest): boolean {
  const token = req.cookies[COOKIE_NAME]
  if (!token) return false
  try {
    jwt.verify(token, SECRET)
    return true
  } catch {
    return false
  }
}
