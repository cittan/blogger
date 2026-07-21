'use client'

import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import type { PaginatedResponse } from '@/types/api'
import type { PostListItem, Post, Anime, WikiCategory, WikiCategoryTree, WikiPage, WikiPageListItem, Essay, Friend, SiteStats } from '@/types'

const BASE = '/api/v1'

// --- Posts ---
export function usePosts(params?: { cursor?: string; limit?: number; category?: string; keyword?: string }) {
  const searchParams = new URLSearchParams()
  if (params?.cursor) searchParams.set('cursor', params.cursor)
  if (params?.limit) searchParams.set('limit', String(params.limit))
  if (params?.category) searchParams.set('category', params.category)
  if (params?.keyword) searchParams.set('keyword', params.keyword)

  return useQuery({
    queryKey: ['posts', params],
    queryFn: async () => {
      const res = await fetch(`${BASE}/posts?${searchParams}`)
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`API ${res.status}: ${text.slice(0, 200)}`)
      }
      const json = (await res.json()) as { success: boolean; error?: { message: string }; data: unknown }
      if (!json.success) throw new Error(json.error?.message ?? '获取文章列表失败')
      return json.data as { items: PostListItem[]; nextCursor: string | null; hasMore: boolean }
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

// --- Posts (infinite scroll) ---
export function useInfinitePosts(params?: { limit?: number; category?: string }) {
  return useInfiniteQuery({
    queryKey: ['posts', 'infinite', params],
    queryFn: async ({ pageParam }) => {
      const searchParams = new URLSearchParams()
      searchParams.set('limit', String(params?.limit ?? 20))
      if (pageParam) searchParams.set('cursor', pageParam as string)
      if (params?.category) searchParams.set('category', params.category)
      const res = await fetch(`${BASE}/posts?${searchParams}`)
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`API ${res.status}: ${text.slice(0, 200)}`)
      }
      const json = (await res.json()) as { success: boolean; error?: { message: string }; data: unknown }
      if (!json.success) throw new Error(json.error?.message ?? '获取文章列表失败')
      return json.data as PaginatedResponse<PostListItem>
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

export function usePost(slug: string) {
  return useQuery({
    queryKey: ['post', slug],
    queryFn: async () => {
      const res = await fetch(`${BASE}/posts/${slug}`)
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`API ${res.status}: ${text.slice(0, 200)}`)
      }
      const json = (await res.json()) as { success: boolean; error?: { message: string }; data: unknown }
      if (!json.success) throw new Error(json.error?.message ?? '获取文章失败')
      return json.data as Post
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!slug,
    retry: 1,
  })
}

// --- Anime ---
export function useAnimeList() {
  return useQuery({
    queryKey: ['anime'],
    queryFn: async () => {
      const res = await fetch(`${BASE}/anime`)
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`API ${res.status}: ${text.slice(0, 200)}`)
      }
      const json = (await res.json()) as { success: boolean; error?: { message: string }; data: unknown }
      if (!json.success) throw new Error(json.error?.message ?? '获取动漫列表失败')
      return json.data as Anime[]
    },
    staleTime: 30 * 60 * 1000,
    retry: 1,
  })
}

// --- Wiki ---
export function useWikiCategories() {
  return useQuery({
    queryKey: ['wiki-categories'],
    queryFn: async () => {
      const res = await fetch(`${BASE}/wiki`)
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`API ${res.status}: ${text.slice(0, 200)}`)
      }
      const json = (await res.json()) as { success: boolean; error?: { message: string }; data: unknown }
      if (!json.success) throw new Error(json.error?.message ?? '获取 Wiki 分类失败')
      return json.data as WikiCategory[]
    },
    staleTime: 60 * 60 * 1000,
    retry: 1,
  })
}

export function useWikiCategoryTree() {
  return useQuery({
    queryKey: ['wiki-category-tree'],
    queryFn: async () => {
      const res = await fetch(`${BASE}/wiki?type=tree`)
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`API ${res.status}: ${text.slice(0, 200)}`)
      }
      const json = (await res.json()) as { success: boolean; error?: { message: string }; data: unknown }
      if (!json.success) throw new Error(json.error?.message ?? '获取 Wiki 分类树失败')
      return json.data as WikiCategoryTree[]
    },
    staleTime: 60 * 60 * 1000,
    retry: 1,
  })
}

export function useWikiPageBySlug(slug: string) {
  return useQuery({
    queryKey: ['wiki-page', slug],
    queryFn: async () => {
      const res = await fetch(`${BASE}/wiki/pages/${slug}`)
      if (!res.ok) throw new Error('获取页面失败')
      const json = (await res.json()) as { success: boolean; data: WikiPage }
      return json.data
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })
}

// --- Admin Wiki ---
export function useAdminWikiCategories() {
  return useQuery({
    queryKey: ['admin-wiki-categories'],
    queryFn: async () => {
      const res = await fetch(`${BASE}/admin/wiki/categories`)
      if (!res.ok) throw new Error('获取分类失败')
      const json = (await res.json()) as { success: boolean; data: WikiCategory[] }
      return json.data
    },
    staleTime: 60 * 60 * 1000,
    retry: 1,
  })
}

export function useAdminWikiCategoryTree() {
  return useQuery({
    queryKey: ['admin-wiki-category-tree'],
    queryFn: async () => {
      const res = await fetch(`${BASE}/admin/wiki/categories/tree`)
      if (!res.ok) throw new Error('获取分类树失败')
      const json = (await res.json()) as { success: boolean; data: WikiCategoryTree[] }
      return json.data
    },
    staleTime: 60 * 60 * 1000,
    retry: 1,
  })
}

export function useAdminWikiPages(params?: { categoryId?: number; isPublished?: boolean; keyword?: string }) {
  return useQuery({
    queryKey: ['admin-wiki-pages', params],
    queryFn: async () => {
      const searchParams = new URLSearchParams()
      if (params?.categoryId) searchParams.set('categoryId', String(params.categoryId))
      if (params?.isPublished !== undefined) searchParams.set('isPublished', String(params.isPublished))
      if (params?.keyword) searchParams.set('keyword', params.keyword)

      const res = await fetch(`${BASE}/admin/wiki/pages?${searchParams}`)
      if (!res.ok) throw new Error('获取页面列表失败')
      const json = (await res.json()) as { success: boolean; data: { items: WikiPageListItem[]; total: number } }
      return json.data
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })
}

export function useAdminWikiPage(id: number) {
  return useQuery({
    queryKey: ['admin-wiki-page', id],
    queryFn: async () => {
      const res = await fetch(`${BASE}/admin/wiki/pages/${id}`)
      if (!res.ok) throw new Error('获取页面失败')
      const json = (await res.json()) as { success: boolean; data: WikiPage }
      return json.data
    },
    enabled: !!id,
    retry: 1,
  })
}

// --- Essays ---
export function useEssays(params?: { cursor?: string; limit?: number }) {
  const searchParams = new URLSearchParams()
  if (params?.cursor) searchParams.set('cursor', params.cursor)
  if (params?.limit) searchParams.set('limit', String(params.limit))

  return useQuery({
    queryKey: ['essays', params],
    queryFn: async () => {
      const res = await fetch(`${BASE}/essays?${searchParams}`)
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`API ${res.status}: ${text.slice(0, 200)}`)
      }
      const json = (await res.json()) as { success: boolean; error?: { message: string }; data: unknown }
      if (!json.success) throw new Error(json.error?.message ?? '获取随笔列表失败')
      return json.data as { items: Essay[]; nextCursor: string | null; hasMore: boolean }
    },
    staleTime: 10 * 60 * 1000,
    retry: 1,
  })
}

export function useEssay(slug: string) {
  return useQuery({
    queryKey: ['essay', slug],
    queryFn: async () => {
      const res = await fetch(`${BASE}/essays/${slug}`)
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`API ${res.status}: ${text.slice(0, 200)}`)
      }
      const json = (await res.json()) as { success: boolean; error?: { message: string }; data: unknown }
      if (!json.success) throw new Error(json.error?.message ?? '获取随笔失败')
      return json.data as Essay
    },
    enabled: !!slug,
    retry: 1,
  })
}

// --- Friends ---
export function useFriends() {
  return useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const res = await fetch(`${BASE}/friends`)
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`API ${res.status}: ${text.slice(0, 200)}`)
      }
      const json = (await res.json()) as { success: boolean; error?: { message: string }; data: unknown }
      if (!json.success) throw new Error(json.error?.message ?? '获取友链失败')
      return json.data as Friend[]
    },
    staleTime: 60 * 60 * 1000,
    retry: 1,
  })
}

// --- Stats ---
export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const res = await fetch(`${BASE}/stats`)
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`API ${res.status}: ${text.slice(0, 200)}`)
      }
      const json = (await res.json()) as { success: boolean; error?: { message: string }; data: unknown }
      if (!json.success) throw new Error(json.error?.message ?? '获取统计信息失败')
      return json.data as SiteStats
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  })
}
