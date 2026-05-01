const store = new Map<string, number[]>()

export function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const hits = (store.get(ip) ?? []).filter(t => now - t < windowMs)
  if (hits.length >= limit) return false
  hits.push(now)
  store.set(ip, hits)
  return true
}
