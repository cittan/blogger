'use client'

import { useQuery } from '@tanstack/react-query'
import type { PostListItem, Post, Anime, WikiCategory, WikiPage, Essay, Friend, SiteStats } from '@/types'

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
      const json = (await res.json()) as { success: boolean; error?: { message: string }; data: unknown }
      if (!json.success) throw new Error(json.error?.message ?? '获取文章列表失败')
      return json.data as { items: PostListItem[]; nextCursor: string | null; hasMore: boolean }
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function usePost(slug: string) {
  return useQuery({
    queryKey: ['post', slug],
    queryFn: async () => {
      const res = await fetch(`${BASE}/posts/${slug}`)
      const json = (await res.json()) as { success: boolean; error?: { message: string }; data: unknown }
      if (!json.success) throw new Error(json.error?.message ?? '获取文章失败')
      return json.data as Post
    },
    staleTime: 10 * 60 * 1000,
    enabled: !!slug,
  })
}

// --- Anime ---
export function useAnimeList() {
  return useQuery({
    queryKey: ['anime'],
    queryFn: async () => {
      // For now, hardcode an empty anime list since there's no public anime API yet.
      // Will be wired when the API is added.
      return [] as Anime[]
    },
    staleTime: 30 * 60 * 1000,
  })
}

// --- Wiki ---
export function useWikiCategories() {
  return useQuery({
    queryKey: ['wiki-categories'],
    queryFn: async () => {
      // Wire to API when available
      return [] as WikiCategory[]
    },
    staleTime: 60 * 60 * 1000,
  })
}

export function useWikiPage(category: string, slug: string) {
  return useQuery({
    queryKey: ['wiki-page', category, slug],
    queryFn: async () => {
      const res = await fetch(`${BASE}/wiki/${category}/${slug}`)
      if (!res.ok) throw new Error('获取页面失败')
      const json = (await res.json()) as { success: boolean; data: WikiPage }
      return json.data
    },
    enabled: !!category && !!slug,
  })
}

// --- Essays ---
export function useEssays(params?: { cursor?: string; limit?: number }) {
  return useQuery({
    queryKey: ['essays', params],
    queryFn: async () => {
      return [] as Essay[]
    },
    staleTime: 10 * 60 * 1000,
  })
}

export function useEssay(slug: string) {
  return useQuery({
    queryKey: ['essay', slug],
    queryFn: async () => {
      if (!slug) throw new Error('没有 slug')
      return null as Essay | null
    },
    enabled: !!slug,
  })
}

// --- Friends ---
export function useFriends() {
  return useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      return [] as Friend[]
    },
    staleTime: 60 * 60 * 1000,
  })
}

// --- Stats ---
export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      return {
        totalViews: 0,
        totalPosts: 0,
        recentPosts: [],
        popularPosts: [],
      } as SiteStats
    },
    staleTime: 2 * 60 * 1000,
  })
}
