import { z } from 'zod'

export const wikiPageSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  category: z.string().min(1).max(50),
  content: z.string().min(1),
})
