import { z } from 'zod'

export const postSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'slug 格式不正确'),
  summary: z.string().max(500).optional().default(''),
  content: z.string().min(1, '内容不能为空'),
  cover: z.string().optional().default(''),
  category: z.enum(['tech', 'life', 'anime', 'essay']).default('tech'),
  tags: z.array(z.string().max(30)).max(10).default([]),
  isPublished: z.boolean().optional().default(false),
})

export const updatePostSchema = postSchema.partial().extend({
  isPublished: z.boolean().optional(),
  isPinned: z.boolean().optional(),
})
