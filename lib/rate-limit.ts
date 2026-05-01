const store = new Map<string, number[]>()

export function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const hits = (store.get(ip) ?? []).filter(t => now - t < windowMs)
  if (hits.length >= limit) {
    store.set(ip, hits)
    return false
  }
  hits.push(now)
  store.set(ip, hits)
  // Clean up entries older than window to prevent unbounded growth
  if (hits.length === 1) {
    setTimeout(() => {
      const current = store.get(ip) ?? []
      const fresh = current.filter(t => Date.now() - t < windowMs)
      if (fresh.length === 0) store.delete(ip)
      else store.set(ip, fresh)
    }, windowMs)
  }
  return true
}
