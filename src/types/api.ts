export interface ApiResponse<T> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
  }
}

export interface PaginatedResponse<T> {
  items: T[]
  nextCursor: string | null
  hasMore: boolean
}

export interface CreatePostInput {
  title: string
  slug: string
  summary?: string
  content: string
  cover?: string
  category: string
  tags: string[]
}

export interface UpdatePostInput extends Partial<CreatePostInput> {
  isPublished?: boolean
}
