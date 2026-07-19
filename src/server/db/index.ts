import { getRequestContext } from '@cloudflare/next-on-pages'

export function getDB(): D1Database | null {
  try {
    const { env } = getRequestContext() as { env: Record<string, unknown> }
    return (env.DB ?? null) as D1Database | null
  } catch {
    return null
  }
}
