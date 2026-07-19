export function getDB(): D1Database {
  throw new Error(
    'In development, use getRequestContext().env.DB directly in route handlers'
  )
}

export interface D1Result<T> {
  results: T[]
  success: boolean
  meta: object
}
