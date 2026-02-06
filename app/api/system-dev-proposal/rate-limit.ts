const windowMs = 60 * 60 * 1000 // 1 hour
const maxRequests: Record<string, number> = {
  generate: 5,
  chat: 30,
}

const store = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  ip: string,
  endpoint: 'generate' | 'chat',
): { allowed: boolean; remaining: number } {
  const key = `${endpoint}:${ip}`
  const now = Date.now()
  const limit = maxRequests[endpoint]
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0 }
  }

  store.set(key, { count: entry.count + 1, resetAt: entry.resetAt })
  return { allowed: true, remaining: limit - entry.count - 1 }
}
