import { z } from 'zod'

export const animeSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  cover: z.string().url().optional().default(''),
  season: z.string().max(20).optional().default(''),
  year: z.number().int().min(1900).max(2100),
  status: z.enum(['watching', 'completed', 'paused', 'planned']).default('watching'),
  progress: z.number().int().min(0).default(0),
  totalEpisodes: z.number().int().min(0).default(0),
  notes: z.string().max(2000).optional().default(''),
  rating: z.number().int().min(0).max(10).default(0),
})
