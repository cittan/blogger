import { getRequestContext } from '@cloudflare/next-on-pages'

export function getDB(): D1Database | null {
  try {
    const ctx = getRequestContext()
    // getRequestContext returns a typed object; cast to access custom bindings
    return ((ctx as unknown as Record<string, unknown>)?.env as Record<string, unknown>)?.DB as D1Database | null
  } catch {
    return null
  }
}
