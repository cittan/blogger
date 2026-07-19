export interface Post {
  id: number
  title: string
  slug: string
  summary: string
  content: string
  cover: string
  category: 'tech' | 'life' | 'anime' | 'essay'
  readingTime: number
  views: number
  isPublished: boolean
  publishedAt: string | null
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface PostListItem {
  id: number
  title: string
  slug: string
  summary: string
  category: string
  tags: string[]
  publishedAt: string | null
  readingTime: number
  views: number
}

export interface Anime {
  id: number
  title: string
  slug: string
  cover: string
  season: string
  year: number
  status: 'watching' | 'completed' | 'paused' | 'planned'
  progress: number
  totalEpisodes: number
  notes: string
  rating: number
  createdAt: string
  updatedAt: string
}

export interface WikiPage {
  id: number
  title: string
  slug: string
  category: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface WikiCategory {
  category: string
  pages: { title: string; slug: string }[]
  count: number
}

export interface Essay {
  id: number
  title: string
  slug: string
  summary: string
  content: string
  readingTime: number
  isPublished: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Friend {
  id: number
  name: string
  url: string
  avatar: string
  description: string
  sortOrder: number
}

export interface SiteStats {
  totalViews: number
  totalPosts: number
  recentPosts: PostListItem[]
  popularPosts: PostListItem[]
}

export interface User {
  id: number
  email: string
  name: string
}
