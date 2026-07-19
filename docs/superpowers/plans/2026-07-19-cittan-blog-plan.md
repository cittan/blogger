# cittan blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-ready personal blog ("手帖" dark-warm design) with blog posts, knowledge base, anime tracking, essays, and friend links, deployed to Cloudflare Pages.

**Architecture:** Next.js 14 App Router with Server Components for SSR pages, API routes for client-side data fetching, a Service → Repository → D1 backend layer, and Cloudflare Pages + D1 + Images for deployment. Design uses dark-warm palette (#1e2128 base, #d4745c accent), LXGW WenKai + JetBrains Mono fonts, and a "digital journal" aesthetic.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Cloudflare D1, @cloudflare/next-on-pages, Shiki, Mermaid, KaTeX, next-auth, TanStack Query, Zustand, Zod, Vitest, Playwright

---

## File Structure

```
blogger/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout (fonts, metadata, providers)
│   │   ├── global.css              # Global styles + design tokens
│   │   ├── page.tsx                # Entry page (avatar + cursor effects)
│   │   ├── (public)/
│   │   │   ├── blog/
│   │   │   │   ├── page.tsx        # Blog list
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx    # Blog post detail
│   │   │   ├── anime/
│   │   │   │   └── page.tsx        # Anime tracking timeline
│   │   │   ├── wiki/
│   │   │   │   ├── page.tsx        # Wiki category grid
│   │   │   │   └── [category]/
│   │   │   │       ├── page.tsx    # Category page list
│   │   │   │       └── [page]/
│   │   │   │           └── page.tsx # Wiki page detail
│   │   │   ├── essays/
│   │   │   │   ├── page.tsx        # Essays list
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx    # Essay detail
│   │   │   ├── friends/
│   │   │   │   └── page.tsx        # Friend links
│   │   │   └── search/
│   │   │       └── page.tsx        # Search results
│   │   ├── (admin)/
│   │   │   ├── layout.tsx          # Admin layout (sidebar + auth guard)
│   │   │   ├── page.tsx            # Dashboard
│   │   │   ├── posts/
│   │   │   │   ├── page.tsx        # Post management list
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx    # New post editor
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── page.tsx # Edit post editor
│   │   │   ├── wiki/
│   │   │   │   └── page.tsx        # Wiki management
│   │   │   ├── anime/
│   │   │   │   └── page.tsx        # Anime management
│   │   │   └── media/
│   │   │       └── page.tsx        # Media library
│   │   └── api/
│   │       └── v1/
│   │           ├── posts/
│   │           │   ├── route.ts    # GET posts list
│   │           │   └── [slug]/
│   │           │       └── route.ts # GET post detail
│   │           └── admin/
│   │               ├── posts/
│   │               │   └── route.ts # POST/PUT/DELETE posts
│   │               └── upload/
│   │                   └── route.ts # POST image upload
│   ├── components/
│   │   ├── ui/                     # Primitive UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Tag.tsx
│   │   │   ├── Divider.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Skeleton.tsx
│   │   ├── blog/                   # Blog-specific components
│   │   │   ├── PostCard.tsx
│   │   │   ├── CategoryFilter.tsx
│   │   │   ├── MarkdownRenderer.tsx
│   │   │   ├── CodeBlock.tsx
│   │   │   ├── AsideNote.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── PostNav.tsx
│   │   ├── dashboard/              # Admin dashboard components
│   │   │   ├── StatsCard.tsx
│   │   │   ├── PostEditor.tsx
│   │   │   └── MediaUploader.tsx
│   │   └── layout/                 # Layout components
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       ├── MobileMenu.tsx
│   │       ├── AdminSidebar.tsx
│   │       ├── EntryPage.tsx       # Entry page with cursor effects
│   │       └── Particles.tsx       # Ambient particle system
│   ├── server/
│   │   ├── services/
│   │   │   ├── posts.ts
│   │   │   ├── anime.ts
│   │   │   ├── wiki.ts
│   │   │   ├── essays.ts
│   │   │   ├── friends.ts
│   │   │   └── stats.ts
│   │   ├── repositories/
│   │   │   ├── posts.ts
│   │   │   ├── anime.ts
│   │   │   ├── wiki.ts
│   │   │   ├── essays.ts
│   │   │   └── friends.ts
│   │   └── db/
│   │       └── index.ts            # D1 client initialization
│   ├── hooks/
│   │   ├── useCursorEffect.ts      # Entry page cursor parallax
│   │   ├── useParticles.ts         # Particle system hook
│   │   └── useScrollProgress.ts    # Reading progress hook
│   ├── types/
│   │   ├── index.ts                # Shared types (Post, Anime, Wiki, etc.)
│   │   └── api.ts                  # API request/response types
│   ├── schemas/
│   │   ├── posts.ts                # Zod schemas for posts
│   │   ├── anime.ts                # Zod schemas for anime
│   │   └── wiki.ts                 # Zod schemas for wiki
│   └── utils/
│       ├── markdown.ts             # Markdown processing (Shiki, Mermaid, KaTeX)
│       ├── date.ts                 # Date formatting (● YYYY.MM.DD)
│       ├── cn.ts                   # Classname utility (clsx + twMerge)
│       └── readingTime.ts          # Calculate reading time
├── migrations/
│   └── 0001_init.sql              # Initial D1 schema
├── public/
│   └── avatar.webp                 # Default avatar
├── wrangler.toml
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Phase 1: Project Scaffold & Configuration

### Task 1: Initialize Next.js project with Cloudflare Pages

**Files:**
- Create: `package.json`
- Create: `next.config.js`
- Create: `wrangler.toml`
- Create: `tsconfig.json`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "cittan-blog",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "pages:build": "npx @cloudflare/next-on-pages",
    "preview": "npx @cloudflare/next-on-pages && npx wrangler pages dev .vercel/output/static",
    "deploy": "npx @cloudflare/next-on-pages && npx wrangler pages deploy .vercel/output/static"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.5.0",
    "zod": "^3.23.0",
    "next-auth": "^4.24.0",
    "shiki": "^1.0.0",
    "mermaid": "^10.0.0",
    "katex": "^0.16.0",
    "unified": "^11.0.0",
    "remark-parse": "^11.0.0",
    "remark-gfm": "^4.0.0",
    "remark-rehype": "^11.0.0",
    "rehype-stringify": "^10.0.0",
    "rehype-katex": "^7.0.0",
    "rehype-slug": "^6.0.0",
    "rehype-autolink-headings": "^7.0.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.3.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "@types/react": "^18.3.0",
    "@types/node": "^20.0.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "vitest": "^1.6.0",
    "@playwright/test": "^1.44.0",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.0",
    "@cloudflare/next-on-pages": "^1.13.0",
    "wrangler": "^3.0.0"
  }
}
```

- [ ] **Step 2: Create next.config.js**

Run: `npm install`

Then create `next.config.js`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.cloudflareimages.com' },
    ],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
```

- [ ] **Step 3: Create wrangler.toml**

```toml
name = "cittan-blog"
compatibility_date = "2026-07-19"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "cittan-blog-db"
database_id = ""

[[r2_buckets]]
binding = "IMAGES"
bucket_name = "cittan-blog-images"
```

- [ ] **Step 4: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["@cloudflare/workers-types"]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 5: Create tailwind.config.ts**

Run: `npx tailwindcss init -p --ts`

Then update with design token extensions:

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#1e2128',
        card: '#252830',
        text: {
          primary: '#f0ebe3',
          secondary: '#8b8680',
        },
        accent: {
          red: '#d4745c',
          teal: '#7a9a8a',
          amber: '#e6b450',
          green: '#8aaa7a',
        },
      },
      fontFamily: {
        serif: ['"LXGW WenKai"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      maxWidth: {
        content: '680px',
        page: '1200px',
      },
      borderRadius: {
        journal: '6px',
      },
      boxShadow: {
        glow: '0 0 30px rgba(212, 116, 92, 0.15)',
        'glow-sm': '0 0 15px rgba(212, 116, 92, 0.1)',
      },
    },
  },
  plugins: [],
}
export default config
```

---

### Task 2: Create design tokens and global styles

**Files:**
- Create: `src/app/global.css`

- [ ] **Step 1: Create global.css with design tokens and utility classes**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=LXGW+WenKai:wght@300;700&family=JetBrains+Mono:wght@400;500&display=swap');

@layer base {
  * {
    @apply box-border;
  }

  html {
    @apply scroll-smooth;
  }

  body {
    @apply bg-bg text-text-primary font-serif antialiased;
    font-size: 15px;
    line-height: 1.85;
  }

  /* Selection color */
  ::selection {
    @apply bg-accent-red/30 text-text-primary;
  }

  /* Scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-track {
    @apply bg-bg;
  }
  ::-webkit-scrollbar-thumb {
    @apply bg-text-secondary/20 rounded-full;
  }
  ::-webkit-scrollbar-thumb:hover {
    @apply bg-text-secondary/40;
  }
}

@layer components {
  /* Card with journal-style border */
  .card {
    @apply bg-card rounded-journal border;
    border-color: rgba(240, 235, 227, 0.06);
  }

  .card-hover {
    @apply transition-all duration-300 ease-out;
  }
  .card-hover:hover {
    border-color: rgba(212, 116, 92, 0.25);
  }

  /* Stamp-style tag */
  .tag {
    @apply inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs;
    @apply bg-accent-teal/15 text-accent-teal border border-accent-teal/25;
  }

  .tag-red {
    @apply bg-accent-red/15 text-accent-red border border-accent-red/25;
  }

  /* Decorative divider */
  .divider-decor {
    @apply text-center text-text-secondary/40 text-xs tracking-widest py-8;
  }

  /* Nav link with red dot indicator */
  .nav-link {
    @apply text-text-secondary hover:text-text-primary transition-colors duration-200;
    @apply text-sm tracking-wide;
  }

  .nav-link.active {
    @apply text-accent-red;
  }
  .nav-link.active::before {
    content: '●';
    @apply text-accent-red mr-1.5 text-[8px] align-middle;
  }
}

@layer utilities {
  /* Glass effect for header */
  .glass {
    @apply backdrop-blur-md bg-bg/80;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat: scaffold project with Next.js, Tailwind, and design tokens"
```

---

## Phase 2: Database Schema & Migrations

### Task 3: Create D1 migration

**Files:**
- Create: `migrations/0001_init.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT DEFAULT '',
  content TEXT NOT NULL,
  cover TEXT DEFAULT '',
  category TEXT NOT NULL DEFAULT 'tech',
  reading_time INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  is_published INTEGER DEFAULT 0,
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(is_published, published_at DESC);

-- Post tags
CREATE TABLE IF NOT EXISTS post_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  UNIQUE(post_id, name)
);

CREATE INDEX IF NOT EXISTS idx_post_tags_name ON post_tags(name);

-- Anime
CREATE TABLE IF NOT EXISTS anime (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  cover TEXT DEFAULT '',
  season TEXT DEFAULT '',
  year INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'watching', -- watching, completed, paused, planned
  progress INTEGER DEFAULT 0,
  total_episodes INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  rating INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_anime_status ON anime(status);
CREATE INDEX IF NOT EXISTS idx_anime_year ON anime(year DESC);

-- Wiki pages
CREATE TABLE IF NOT EXISTS wiki_pages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(category, slug)
);

CREATE INDEX IF NOT EXISTS idx_wiki_category ON wiki(category);

-- Essays
CREATE TABLE IF NOT EXISTS essays (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  summary TEXT DEFAULT '',
  content TEXT NOT NULL,
  reading_time INTEGER DEFAULT 0,
  is_published INTEGER DEFAULT 0,
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_essays_created ON essays(created_at DESC);

-- Friend links
CREATE TABLE IF NOT EXISTS friends (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  avatar TEXT DEFAULT '',
  description TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_friends_sort ON friends(sort_order);

-- Users (for admin auth)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Site statistics
CREATE TABLE IF NOT EXISTS site_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  total_views INTEGER DEFAULT 0,
  total_posts INTEGER DEFAULT 0,
  date TEXT NOT NULL DEFAULT (date('now'))
);

CREATE INDEX IF NOT EXISTS idx_site_stats_date ON site_stats(date DESC);
```

- [ ] **Step 2: Create local D1 database and apply migration**

```bash
npx wrangler d1 create cittan-blog-db
npx wrangler d1 execute cittan-blog-db --local --file=migrations/0001_init.sql
```

- [ ] **Step 3: Commit**

```bash
git add migrations/0001_init.sql && git commit -m "feat: add initial D1 database schema"
```

---

## Phase 3: Core Infrastructure

### Task 4: Create TypeScript types

**Files:**
- Create: `src/types/index.ts`
- Create: `src/types/api.ts`

- [ ] **Step 1: Write domain types**

```typescript
// src/types/index.ts
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
```

```typescript
// src/types/api.ts
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
```

- [ ] **Step 2: Commit**

```bash
git add src/types/ && git commit -m "feat: add TypeScript types for domain and API"
```

---

### Task 5: Create utility functions

**Files:**
- Create: `src/utils/cn.ts`
- Create: `src/utils/date.ts`
- Create: `src/utils/readingTime.ts`

- [ ] **Step 1: Write cn.ts**

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

- [ ] **Step 2: Write date.ts**

```typescript
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

export function formatDateWithDot(dateStr: string | null | undefined): string {
  const formatted = formatDate(dateStr)
  return formatted ? `● ${formatted}` : ''
}

export function getYear(dateStr: string): number {
  return new Date(dateStr).getFullYear()
}

export function getSeason(dateStr: string): string {
  const m = new Date(dateStr).getMonth() + 1
  if (m <= 3) return '冬'
  if (m <= 6) return '春'
  if (m <= 9) return '夏'
  return '秋'
}
```

- [ ] **Step 3: Write readingTime.ts**

```typescript
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const text = content.replace(/[#*`~\[\]()>|\\]/g, '')
  const wordCount = text.length
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}
```

- [ ] **Step 4: Commit**

```bash
git add src/utils/ && git commit -m "feat: add utility functions for cn, date, readingTime"
```

---

### Task 6: Create D1 database client

**Files:**
- Create: `src/server/db/index.ts`

- [ ] **Step 1: Write D1 client initialization**

```typescript
import { getCloudflareContext } from '@cloudflare/next-on-pages'

export function getDB(): D1Database {
  if (process.env.NODE_ENV === 'development') {
    // In dev, use local binding from wrangler
    throw new Error(
      'In development, use getRequestContext().env.DB directly in route handlers'
    )
  }
  // In production (Cloudflare Pages), use context
  const { env } = getCloudflareContext()
  return env.DB
}

export interface D1Result<T> {
  results: T[]
  success: boolean
  meta: object
}
```

- [ ] **Step 2: Commit**

```bash
git add src/server/db/ && git commit -m "feat: add D1 database client"
```

---

### Task 7: Create Zod validation schemas

**Files:**
- Create: `src/schemas/posts.ts`
- Create: `src/schemas/anime.ts`
- Create: `src/schemas/wiki.ts`

- [ ] **Step 1: Write posts schema**

```typescript
import { z } from 'zod'

export const postSchema = z.object({
  title: z.string().min(1, '标题不能为空').max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, 'slug 格式不正确'),
  summary: z.string().max(500).optional().default(''),
  content: z.string().min(1, '内容不能为空'),
  cover: z.string().url().optional().default(''),
  category: z.enum(['tech', 'life', 'anime', 'essay']).default('tech'),
  tags: z.array(z.string().max(30)).max(10).default([]),
})

export const updatePostSchema = postSchema.partial().extend({
  isPublished: z.boolean().optional(),
})
```

- [ ] **Step 2: Write anime schema**

```typescript
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
```

- [ ] **Step 3: Write wiki schema**

```typescript
import { z } from 'zod'

export const wikiPageSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/),
  category: z.string().min(1).max(50),
  content: z.string().min(1),
})
```

- [ ] **Step 4: Commit**

```bash
git add src/schemas/ && git commit -m "feat: add Zod validation schemas"
```

---

## Phase 4: Layout & Shared Components

### Task 8: Create UI primitives

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/Tag.tsx`
- Create: `src/components/ui/Divider.tsx`
- Create: `src/components/ui/Skeleton.tsx`

- [ ] **Step 1: Write Button.tsx**

```tsx
import { cn } from '@/utils/cn'
import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'md', className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-serif tracking-wide transition-all duration-300',
          'rounded-journal select-none',
          // variants
          variant === 'default' && 'bg-accent-red text-white hover:bg-accent-red/85',
          variant === 'ghost' && 'text-text-secondary hover:text-text-primary',
          variant === 'outline' && 'border text-text-secondary hover:text-accent-red hover:border-accent-red',
          variant === 'outline' && 'border-text-secondary/20',
          // sizes
          size === 'sm' && 'px-3 py-1.5 text-xs',
          size === 'md' && 'px-5 py-2 text-sm',
          size === 'lg' && 'px-8 py-3 text-base',
          // disabled
          props.disabled && 'opacity-40 cursor-not-allowed',
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
```

- [ ] **Step 2: Write Card.tsx**

```tsx
import { cn } from '@/utils/cn'
import { HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  padding?: 'sm' | 'md' | 'lg'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ hover = false, padding = 'md', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'card',
          padding === 'sm' && 'p-5',
          padding === 'md' && 'p-7',
          padding === 'lg' && 'p-10',
          hover && 'card-hover',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = 'Card'
```

- [ ] **Step 3: Write Tag.tsx**

```tsx
import { cn } from '@/utils/cn'

interface TagProps {
  children: React.ReactNode
  variant?: 'default' | 'red' | 'green' | 'gray'
  className?: string
}

export function Tag({ children, variant = 'default', className }: TagProps) {
  return (
    <span
      className={cn(
        'tag',
        variant === 'red' && 'tag-red',
        variant === 'green' && 'bg-accent-green/15 text-accent-green border-accent-green/25',
        variant === 'gray' && 'bg-text-secondary/10 text-text-secondary border-text-secondary/15',
        className
      )}
    >
      {children}
    </span>
  )
}
```

- [ ] **Step 4: Write Divider.tsx**

```tsx
export function Divider() {
  return (
    <div className="divider-decor" aria-hidden="true">
      ——— ※ ———
    </div>
  )
}
```

- [ ] **Step 5: Write Skeleton.tsx**

```tsx
import { cn } from '@/utils/cn'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-journal bg-text-secondary/5',
        className
      )}
    />
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/ && git commit -m "feat: add UI primitives (Button, Card, Tag, Divider, Skeleton)"
```

---

### Task 9: Create Header and Footer

**Files:**
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/Footer.tsx`
- Create: `src/components/layout/MobileMenu.tsx`

- [ ] **Step 1: Write Header.tsx**

```tsx
'use client'

import { cn } from '@/utils/cn'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_ITEMS = [
  { href: '/blog', label: '博客' },
  { href: '/wiki', label: '知识库' },
  { href: '/anime', label: '追番' },
  { href: '/essays', label: '杂谈' },
  { href: '/friends', label: '友链' },
]

export function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === '/blog' && pathname.startsWith('/blog')) return true
    return pathname === href
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-text-secondary/5">
      <nav className="max-w-page mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-text-primary hover:text-accent-red transition-colors text-sm tracking-wider"
        >
          <span className="text-accent-red text-[10px] align-middle mr-1.5">●</span>
          cittan
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn('nav-link', isActive(item.href) && 'active')}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/search"
            className="text-text-secondary hover:text-text-primary transition-colors text-sm"
            aria-label="搜索"
          >
            ○
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-text-secondary hover:text-text-primary transition-colors text-sm"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="菜单"
        >
          {menuOpen ? '✕' : '≡'}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-text-secondary/5 bg-bg/95 backdrop-blur-md">
          <div className="px-6 py-4 flex flex-col gap-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn('nav-link text-base', isActive(item.href) && 'active')}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/search"
              className="nav-link text-base"
              onClick={() => setMenuOpen(false)}
            >
              搜索
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
```

- [ ] **Step 2: Write Footer.tsx**

```tsx
import { Divider } from '@/components/ui/Divider'

export function Footer() {
  return (
    <footer className="max-w-page mx-auto px-6 pb-12 pt-4">
      <Divider />
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-secondary">
        <div className="flex items-center gap-4">
          <a href="/rss.xml" className="hover:text-text-primary transition-colors">
            RSS
          </a>
          <a
            href="https://github.com/cittan"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-text-primary transition-colors"
          >
            GitHub
          </a>
        </div>
        <p>© {new Date().getFullYear()} cittan</p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/ && git commit -m "feat: add Header and Footer with mobile drawer"
```

---

### Task 10: Create root layout

**Files:**
- Create: `src/app/layout.tsx`

- [ ] **Step 1: Write root layout**

```tsx
import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Providers } from './providers'
import './global.css'

export const metadata: Metadata = {
  title: {
    default: 'cittan',
    template: '%s — cittan',
  },
  description: '只会vibe coding的fw一个',
  metadataBase: new URL('https://cittan.blog'),
  openGraph: {
    title: 'cittan',
    description: '只会vibe coding的fw一个',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>
          <Header />
          <main className="min-h-screen pt-14">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Create Providers component**

Create `src/app/providers.tsx`:

```tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/layout.tsx src/app/providers.tsx && git commit -m "feat: add root layout with providers and SEO metadata"
```

---

## Phase 5: Entry Page (Landing)

### Task 11: Create cursor effect hooks

**Files:**
- Create: `src/hooks/useCursorEffect.ts`

- [ ] **Step 1: Write cursor parallax hook**

```typescript
'use client'

import { useEffect, useRef } from 'react'

interface ParallaxTarget {
  ref: React.RefObject<HTMLElement | null>
  factor: number // How much to move (pixels multiplier)
}

export function useCursorEffect(targets: ParallaxTarget[]) {
  const rafRef = useRef<number>()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)

      rafRef.current = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2 // -1 to 1
        const y = (e.clientY / window.innerHeight - 0.5) * 2

        targets.forEach(({ ref, factor }) => {
          const el = ref.current
          if (!el) return
          const dx = x * factor
          const dy = y * factor
          el.style.transform = `translate(${dx}px, ${dy}px)`
        })
      })
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [targets])
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/ && git commit -m "feat: add cursor parallax effect hook"
```

---

### Task 12: Create EntryPage component with cursor effects

**Files:**
- Create: `src/components/layout/EntryPage.tsx`
- Create: `src/components/layout/Particles.tsx`

- [ ] **Step 1: Write Particles.tsx**

```tsx
'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
}

export function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -100, y: -100 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Initialize particles
    particlesRef.current = Array.from({ length: 8 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.15 + 0.05,
    }))

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouse)

    // Separate animation loop avoids double-rAF
    let animId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((p) => {
        // Repel from mouse
        const dx = p.x - mouseRef.current.x
        const dy = p.y - mouseRef.current.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) {
          const force = (120 - dist) / 120
          p.vx += (dx / dist) * force * 0.02
          p.vy += (dy / dist) * force * 0.02
        }

        // Apply velocity with damping
        p.vx *= 0.99
        p.vy *= 0.99
        p.x += p.vx
        p.y += p.vy

        // Wrap around
        if (p.x < -10) p.x = canvas.width + 10
        if (p.x > canvas.width + 10) p.x = -10
        if (p.y < -10) p.y = canvas.height + 10
        if (p.y > canvas.height + 10) p.y = -10

        // Draw
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(230, 180, 80, ${p.alpha})`
        ctx.fill()
      })

      animId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouse)
      cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  )
}
```

- [ ] **Step 2: Write EntryPage.tsx**

```tsx
'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { useCursorEffect } from '@/hooks/useCursorEffect'
import { Particles } from './Particles'

export function EntryPage() {
  const avatarRef = useRef<HTMLDivElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const taglineRef = useRef<HTMLParagraphElement>(null)

  useCursorEffect([
    { ref: avatarRef, factor: 10 },
    { ref: nameRef, factor: 5 },
    { ref: taglineRef, factor: 3 },
  ])

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden">
      {/* Background warm glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(230, 180, 80, 0.06) 0%, transparent 70%)',
        }}
      />

      {/* Particles */}
      <Particles />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Avatar with glow */}
        <div
          ref={avatarRef}
          className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-text-secondary/15"
          style={{
            boxShadow: '0 0 40px rgba(212, 116, 92, 0.2), 0 0 80px rgba(212, 116, 92, 0.08)',
          }}
        >
          {/* Replace with actual avatar image */}
          <div className="w-full h-full bg-gradient-to-br from-accent-red/30 to-accent-amber/20 flex items-center justify-center text-3xl">
            c
          </div>
        </div>

        {/* Name */}
        <h1
          ref={nameRef}
          className="text-4xl font-bold text-text-primary tracking-wider"
          style={{ fontFamily: '"LXGW WenKai", serif' }}
        >
          cittan
        </h1>

        {/* Tagline */}
        <p
          ref={taglineRef}
          className="text-sm text-text-secondary tracking-wide"
        >
          只会vibe coding的fw一个
        </p>

        {/* Enter button */}
        <Link
          href="/blog"
          className="mt-8 px-8 py-2.5 border text-text-secondary hover:text-accent-red hover:border-accent-red transition-all duration-300 rounded-journal tracking-wider text-sm"
          style={{ borderColor: 'rgba(240, 235, 227, 0.15)' }}
        >
          进入博客 →
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Wire up entry page as `/`**

Create `src/app/page.tsx`:

```tsx
import { EntryPage } from '@/components/layout/EntryPage'

// Hide Header/Footer on entry page — handled by checking pathname
// For simplicity, use a separate layout
export default function Home() {
  return <EntryPage />
}
```

For the entry page to work without Header/Footer, update `src/app/layout.tsx`:

```tsx
import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Providers } from './providers'
import { LayoutShell } from '@/components/layout/LayoutShell'
import './global.css'

export const metadata: Metadata = {
  title: {
    default: 'cittan',
    template: '%s — cittan',
  },
  description: '只会vibe coding的fw一个',
  metadataBase: new URL('https://cittan.blog'),
  openGraph: {
    title: 'cittan',
    description: '只会vibe coding的fw一个',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  )
}
```

Create `src/components/layout/LayoutShell.tsx`:

```tsx
'use client'

import { usePathname } from 'next/navigation'
import { Header } from './Header'
import { Footer } from './Footer'

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isEntry = pathname === '/'

  if (isEntry) {
    return <>{children}</>
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-14">{children}</main>
      <Footer />
    </>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add src/hooks/ src/components/layout/EntryPage.tsx src/components/layout/Particles.tsx src/components/layout/LayoutShell.tsx src/app/layout.tsx src/app/page.tsx && git commit -m "feat: add entry page with cursor parallax, glow, and particles"
```

---

## Phase 6: Server Layer (Services & Repositories)

### Task 13: Create posts repository and service

**Files:**
- Create: `src/server/repositories/posts.ts`
- Create: `src/server/services/posts.ts`

- [ ] **Step 1: Write posts repository**

```typescript
// src/server/repositories/posts.ts
import type { Post, PostListItem } from '@/types'

export class PostsRepository {
  constructor(private db: D1Database) {}

  async list(params: {
    cursor?: string
    limit?: number
    category?: string
    tag?: string
    keyword?: string
  }): Promise<{ items: PostListItem[]; nextCursor: string | null; hasMore: boolean }> {
    const limit = params.limit ?? 10
    const conditions: string[] = ['p.is_published = 1']
    const bindings: any[] = []

    if (params.cursor) {
      conditions.push('p.published_at < ?')
      bindings.push(params.cursor)
    }
    if (params.category) {
      conditions.push('p.category = ?')
      bindings.push(params.category)
    }
    if (params.keyword) {
      conditions.push('(p.title LIKE ? OR p.summary LIKE ?)')
      const kw = `%${params.keyword}%`
      bindings.push(kw, kw)
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const result = await this.db
      .prepare(
        `SELECT p.id, p.title, p.slug, p.summary, p.category, p.reading_time as readingTime,
                p.views, p.published_at as publishedAt
         FROM posts p
         ${where}
         ORDER BY p.published_at DESC
         LIMIT ?`
      )
      .bind(...bindings, limit + 1)
      .all<PostListItem>()

    const items = result.results.slice(0, limit)
    const hasMore = result.results.length > limit
    const nextCursor = hasMore && items.length > 0
      ? items[items.length - 1].publishedAt
      : null

    // Fetch tags for each post
    if (items.length > 0) {
      const placeholders = items.map(() => '?').join(',')
      const ids = items.map((i) => i.id)
      const tagsResult = await this.db
        .prepare(
          `SELECT post_id, name FROM post_tags WHERE post_id IN (${placeholders})`
        )
        .bind(...ids)
        .all<{ post_id: number; name: string }>()

      const tagMap = new Map<number, string[]>()
      for (const row of tagsResult.results) {
        if (!tagMap.has(row.post_id)) tagMap.set(row.post_id, [])
        tagMap.get(row.post_id)!.push(row.name)
      }
      for (const item of items) {
        ;(item as any).tags = tagMap.get(item.id) ?? []
      }
    }

    return { items, nextCursor, hasMore }
  }

  async getBySlug(slug: string): Promise<Post | null> {
    const result = await this.db
      .prepare(
        `SELECT id, title, slug, summary, content, cover, category,
                reading_time as readingTime, views, is_published as isPublished,
                published_at as publishedAt, created_at as createdAt, updated_at as updatedAt
         FROM posts WHERE slug = ? AND is_published = 1`
      )
      .bind(slug)
      .first<Omit<Post, 'tags'>>()

    if (!result) return null

    const tagsResult = await this.db
      .prepare('SELECT name FROM post_tags WHERE post_id = ?')
      .bind(result.id)
      .all<{ name: string }>()

    return {
      ...result,
      tags: tagsResult.results.map((r) => r.name),
    }
  }

  async incrementViews(slug: string): Promise<void> {
    await this.db
      .prepare('UPDATE posts SET views = views + 1 WHERE slug = ?')
      .bind(slug)
      .run()
  }

  async create(input: {
    title: string; slug: string; summary: string; content: string
    cover: string; category: string; tags: string[]; readingTime: number
    isPublished: boolean
  }): Promise<Pick<Post, 'id' | 'slug'>> {
    const publishedAt = input.isPublished ? new Date().toISOString() : null
    const result = await this.db
      .prepare(
        `INSERT INTO posts (title, slug, summary, content, cover, category,
         reading_time, is_published, published_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        input.title, input.slug, input.summary, input.content,
        input.cover, input.category, input.readingTime,
        input.isPublished ? 1 : 0, publishedAt
      )
      .run()

    const id = (result.meta as any).last_row_id

    if (input.tags.length > 0) {
      const stmt = this.db.prepare('INSERT OR IGNORE INTO post_tags (post_id, name) VALUES (?, ?)')
      await Promise.all(input.tags.map((tag) => stmt.bind(id, tag).run()))
    }

    return { id, slug: input.slug }
  }

  async update(slug: string, input: Partial<{
    title: string; summary: string; content: string; cover: string
    category: string; tags: string[]; readingTime: number; isPublished: boolean
  }>): Promise<void> {
    const sets: string[] = []
    const bindings: any[] = []

    if (input.title !== undefined) { sets.push('title = ?'); bindings.push(input.title) }
    if (input.summary !== undefined) { sets.push('summary = ?'); bindings.push(input.summary) }
    if (input.content !== undefined) { sets.push('content = ?'); bindings.push(input.content) }
    if (input.cover !== undefined) { sets.push('cover = ?'); bindings.push(input.cover) }
    if (input.category !== undefined) { sets.push('category = ?'); bindings.push(input.category) }
    if (input.readingTime !== undefined) { sets.push('reading_time = ?'); bindings.push(input.readingTime) }
    if (input.isPublished !== undefined) {
      sets.push('is_published = ?'); bindings.push(input.isPublished ? 1 : 0)
      if (input.isPublished) { sets.push('published_at = COALESCE(published_at, ?)'); bindings.push(new Date().toISOString()) }
    }
    sets.push("updated_at = datetime('now')")

    if (sets.length > 0) {
      bindings.push(slug)
      await this.db
        .prepare(`UPDATE posts SET ${sets.join(', ')} WHERE slug = ?`)
        .bind(...bindings)
        .run()
    }

    if (input.tags !== undefined) {
      const post = await this.db.prepare('SELECT id FROM posts WHERE slug = ?').bind(slug).first<{ id: number }>()
      if (post) {
        await this.db.prepare('DELETE FROM post_tags WHERE post_id = ?').bind(post.id).run()
        const stmt = this.db.prepare('INSERT OR IGNORE INTO post_tags (post_id, name) VALUES (?, ?)')
        await Promise.all(input.tags.map((tag) => stmt.bind(post.id, tag).run()))
      }
    }
  }

  async delete(slug: string): Promise<void> {
    const post = await this.db.prepare('SELECT id FROM posts WHERE slug = ?').bind(slug).first<{ id: number }>()
    if (post) {
      await this.db.prepare('DELETE FROM post_tags WHERE post_id = ?').bind(post.id).run()
      await this.db.prepare('DELETE FROM posts WHERE id = ?').bind(post.id).run()
    }
  }
}
```

- [ ] **Step 2: Write posts service**

```typescript
// src/server/services/posts.ts
import { PostsRepository } from '@/server/repositories/posts'
import { calculateReadingTime } from '@/utils/readingTime'

export class PostsService {
  constructor(private repo: PostsRepository) {}

  async listPosts(params: {
    cursor?: string; limit?: number; category?: string; tag?: string; keyword?: string
  }) {
    return this.repo.list(params)
  }

  async getPost(slug: string) {
    const post = await this.repo.getBySlug(slug)
    if (post) {
      // Fire and forget view increment
      this.repo.incrementViews(slug).catch(() => {})
    }
    return post
  }

  async createPost(input: {
    title: string; slug: string; summary?: string; content: string
    cover?: string; category: string; tags: string[]; isPublished?: boolean
  }) {
    const readingTime = calculateReadingTime(input.content)
    return this.repo.create({
      ...input,
      summary: input.summary ?? '',
      cover: input.cover ?? '',
      readingTime,
      isPublished: input.isPublished ?? false,
    })
  }

  async updatePost(slug: string, input: {
    title?: string; summary?: string; content?: string; cover?: string
    category?: string; tags?: string[]; isPublished?: boolean
  }) {
    const updateData: any = { ...input }
    if (input.content) {
      updateData.readingTime = calculateReadingTime(input.content)
    }
    return this.repo.update(slug, updateData)
  }

  async deletePost(slug: string) {
    return this.repo.delete(slug)
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/server/ && git commit -m "feat: add posts repository and service with cursor pagination"
```

---

### Task 14: Create anime, wiki, essays, friends, stats repositories and services

**Files:**
- Create: `src/server/repositories/anime.ts`
- Create: `src/server/services/anime.ts`
- Create: `src/server/repositories/wiki.ts`
- Create: `src/server/services/wiki.ts`
- Create: `src/server/repositories/essays.ts`
- Create: `src/server/services/essays.ts`
- Create: `src/server/repositories/friends.ts`
- Create: `src/server/services/friends.ts`
- Create: `src/server/services/stats.ts`

- [ ] **Step 1: Write anime repository**

```typescript
// src/server/repositories/anime.ts
import type { Anime } from '@/types'

export class AnimeRepository {
  constructor(private db: D1Database) {}

  async list(status?: string): Promise<Anime[]> {
    let query = `SELECT id, title, slug, cover, season, year, status,
                 progress, total_episodes as totalEpisodes, notes, rating,
                 created_at as createdAt, updated_at as updatedAt
                 FROM anime`
    if (status) {
      query += ' WHERE status = ?'
      const result = await this.db.prepare(query + ' ORDER BY year DESC, season DESC').bind(status).all<Anime>()
      return result.results
    }
    const result = await this.db.prepare(query + ' ORDER BY year DESC, season DESC').all<Anime>()
    return result.results
  }

  async getBySlug(slug: string): Promise<Anime | null> {
    return this.db.prepare(
      `SELECT id, title, slug, cover, season, year, status,
       progress, total_episodes as totalEpisodes, notes, rating,
       created_at as createdAt, updated_at as updatedAt
       FROM anime WHERE slug = ?`
    ).bind(slug).first<Anime>()
  }

  async create(input: Omit<Anime, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const result = await this.db.prepare(
      `INSERT INTO anime (title, slug, cover, season, year, status, progress, total_episodes, notes, rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(input.title, input.slug, input.cover, input.season, input.year,
           input.status, input.progress, input.totalEpisodes, input.notes, input.rating).run()
    return (result.meta as any).last_row_id
  }

  async update(slug: string, input: Partial<Anime>): Promise<void> {
    const sets: string[] = []; const bindings: any[] = []
    if (input.title !== undefined) { sets.push('title = ?'); bindings.push(input.title) }
    if (input.cover !== undefined) { sets.push('cover = ?'); bindings.push(input.cover) }
    if (input.season !== undefined) { sets.push('season = ?'); bindings.push(input.season) }
    if (input.year !== undefined) { sets.push('year = ?'); bindings.push(input.year) }
    if (input.status !== undefined) { sets.push('status = ?'); bindings.push(input.status) }
    if (input.progress !== undefined) { sets.push('progress = ?'); bindings.push(input.progress) }
    if (input.totalEpisodes !== undefined) { sets.push('total_episodes = ?'); bindings.push(input.totalEpisodes) }
    if (input.notes !== undefined) { sets.push('notes = ?'); bindings.push(input.notes) }
    if (input.rating !== undefined) { sets.push('rating = ?'); bindings.push(input.rating) }
    if (sets.length === 0) return
    sets.push("updated_at = datetime('now')")
    bindings.push(slug)
    await this.db.prepare(`UPDATE anime SET ${sets.join(', ')} WHERE slug = ?`).bind(...bindings).run()
  }

  async delete(slug: string): Promise<void> {
    await this.db.prepare('DELETE FROM anime WHERE slug = ?').bind(slug).run()
  }
}
```

- [ ] **Step 2: Write anime service**

```typescript
// src/server/services/anime.ts
import { AnimeRepository } from '@/server/repositories/anime'

export class AnimeService {
  constructor(private repo: AnimeRepository) {}

  async listAnime(status?: string) { return this.repo.list(status) }
  async getAnime(slug: string) { return this.repo.getBySlug(slug) }
  async createAnime(input: Parameters<AnimeRepository['create']>[0]) { return this.repo.create(input) }
  async updateAnime(slug: string, input: Parameters<AnimeRepository['update']>[1]) { return this.repo.update(slug, input) }
  async deleteAnime(slug: string) { return this.repo.delete(slug) }
}
```

- [ ] **Step 3: Write wiki repository**

```typescript
// src/server/repositories/wiki.ts
import type { WikiPage, WikiCategory } from '@/types'

export class WikiRepository {
  constructor(private db: D1Database) {}

  async getCategories(): Promise<WikiCategory[]> {
    const result = await this.db.prepare(
      `SELECT category, COUNT(*) as count FROM wiki_pages GROUP BY category ORDER BY category`
    ).all<{ category: string; count: number }>()

    const categories: WikiCategory[] = []
    for (const row of result.results) {
      const pages = await this.db.prepare(
        'SELECT title, slug FROM wiki_pages WHERE category = ? ORDER BY title'
      ).bind(row.category).all<{ title: string; slug: string }>()
      categories.push({ category: row.category, pages: pages.results, count: row.count })
    }
    return categories
  }

  async getPage(category: string, slug: string): Promise<WikiPage | null> {
    return this.db.prepare(
      `SELECT id, title, slug, category, content,
       created_at as createdAt, updated_at as updatedAt
       FROM wiki_pages WHERE category = ? AND slug = ?`
    ).bind(category, slug).first<WikiPage>()
  }

  async create(input: { title: string; slug: string; category: string; content: string }): Promise<number> {
    const result = await this.db.prepare(
      'INSERT INTO wiki_pages (title, slug, category, content) VALUES (?, ?, ?, ?)'
    ).bind(input.title, input.slug, input.category, input.content).run()
    return (result.meta as any).last_row_id
  }

  async update(category: string, slug: string, input: { title?: string; content?: string }): Promise<void> {
    const sets: string[] = []; const bindings: any[] = []
    if (input.title !== undefined) { sets.push('title = ?'); bindings.push(input.title) }
    if (input.content !== undefined) { sets.push('content = ?'); bindings.push(input.content) }
    if (sets.length === 0) return
    sets.push("updated_at = datetime('now')")
    bindings.push(category, slug)
    await this.db.prepare(`UPDATE wiki_pages SET ${sets.join(', ')} WHERE category = ? AND slug = ?`).bind(...bindings).run()
  }

  async delete(category: string, slug: string): Promise<void> {
    await this.db.prepare('DELETE FROM wiki_pages WHERE category = ? AND slug = ?').bind(category, slug).run()
  }
}
```

- [ ] **Step 4: Write wiki service**

```typescript
// src/server/services/wiki.ts
import { WikiRepository } from '@/server/repositories/wiki'

export class WikiService {
  constructor(private repo: WikiRepository) {}
  async getCategories() { return this.repo.getCategories() }
  async getPage(category: string, slug: string) { return this.repo.getPage(category, slug) }
  async createPage(input: Parameters<WikiRepository['create']>[0]) { return this.repo.create(input) }
  async updatePage(category: string, slug: string, input: Parameters<WikiRepository['update']>[2]) { return this.repo.update(category, slug, input) }
  async deletePage(category: string, slug: string) { return this.repo.delete(category, slug) }
}
```

- [ ] **Step 5: Write essays repository**

```typescript
// src/server/repositories/essays.ts
import type { Essay } from '@/types'

export class EssaysRepository {
  constructor(private db: D1Database) {}

  async list(params: { cursor?: string; limit?: number }): Promise<{ items: Essay[]; nextCursor: string | null; hasMore: boolean }> {
    const limit = params.limit ?? 10
    const bindings: any[] = []

    let where = 'WHERE is_published = 1'
    if (params.cursor) { where += ' AND created_at < ?'; bindings.push(params.cursor) }

    bindings.push(limit + 1)
    const result = await this.db.prepare(
      `SELECT id, title, slug, summary, content, reading_time as readingTime,
              is_published as isPublished, published_at as publishedAt,
              created_at as createdAt, updated_at as updatedAt
       FROM essays ${where} ORDER BY created_at DESC LIMIT ?`
    ).bind(...bindings).all<Essay>()

    const items = result.results.slice(0, limit)
    const hasMore = result.results.length > limit
    const nextCursor = hasMore && items.length > 0 ? items[items.length - 1].createdAt : null
    return { items, nextCursor, hasMore }
  }

  async getBySlug(slug: string): Promise<Essay | null> {
    return this.db.prepare(
      `SELECT id, title, slug, summary, content, reading_time as readingTime,
              is_published as isPublished, published_at as publishedAt,
              created_at as createdAt, updated_at as updatedAt
       FROM essays WHERE slug = ? AND is_published = 1`
    ).bind(slug).first<Essay>()
  }

  async create(input: { title: string; slug: string; summary: string; content: string; readingTime: number }): Promise<number> {
    const result = await this.db.prepare(
      'INSERT INTO essays (title, slug, summary, content, reading_time) VALUES (?, ?, ?, ?, ?)'
    ).bind(input.title, input.slug, input.summary, input.content, input.readingTime).run()
    return (result.meta as any).last_row_id
  }

  async update(slug: string, input: Partial<{ title: string; summary: string; content: string; readingTime: number; isPublished: boolean }>): Promise<void> {
    const sets: string[] = []; const bindings: any[] = []
    if (input.title !== undefined) { sets.push('title = ?'); bindings.push(input.title) }
    if (input.summary !== undefined) { sets.push('summary = ?'); bindings.push(input.summary) }
    if (input.content !== undefined) { sets.push('content = ?'); bindings.push(input.content) }
    if (input.readingTime !== undefined) { sets.push('reading_time = ?'); bindings.push(input.readingTime) }
    if (input.isPublished !== undefined) {
      sets.push('is_published = ?'); bindings.push(input.isPublished ? 1 : 0)
      if (input.isPublished) { sets.push('published_at = COALESCE(published_at, ?)'); bindings.push(new Date().toISOString()) }
    }
    if (sets.length === 0) return
    sets.push("updated_at = datetime('now')")
    bindings.push(slug)
    await this.db.prepare(`UPDATE essays SET ${sets.join(', ')} WHERE slug = ?`).bind(...bindings).run()
  }

  async delete(slug: string): Promise<void> {
    await this.db.prepare('DELETE FROM essays WHERE slug = ?').bind(slug).run()
  }
}
```

- [ ] **Step 6: Write essays service**

```typescript
// src/server/services/essays.ts
import { EssaysRepository } from '@/server/repositories/essays'
import { calculateReadingTime } from '@/utils/readingTime'

export class EssaysService {
  constructor(private repo: EssaysRepository) {}
  async listEssays(params: { cursor?: string; limit?: number }) { return this.repo.list(params) }
  async getEssay(slug: string) { return this.repo.getBySlug(slug) }
  async createEssay(input: { title: string; slug: string; summary?: string; content: string }) {
    return this.repo.create({ ...input, summary: input.summary ?? '', readingTime: calculateReadingTime(input.content) })
  }
  async updateEssay(slug: string, input: { title?: string; summary?: string; content?: string; isPublished?: boolean }) {
    const data: any = { ...input }
    if (input.content) data.readingTime = calculateReadingTime(input.content)
    return this.repo.update(slug, data)
  }
  async deleteEssay(slug: string) { return this.repo.delete(slug) }
}
```

- [ ] **Step 7: Write friends repository**

```typescript
// src/server/repositories/friends.ts
import type { Friend } from '@/types'

export class FriendsRepository {
  constructor(private db: D1Database) {}

  async list(): Promise<Friend[]> {
    const result = await this.db.prepare(
      'SELECT id, name, url, avatar, description, sort_order as sortOrder, created_at as createdAt FROM friends ORDER BY sort_order'
    ).all<Friend>()
    return result.results
  }

  async create(input: { name: string; url: string; avatar?: string; description?: string }): Promise<number> {
    const result = await this.db.prepare(
      'INSERT INTO friends (name, url, avatar, description) VALUES (?, ?, ?, ?)'
    ).bind(input.name, input.url, input.avatar ?? '', input.description ?? '').run()
    return (result.meta as any).last_row_id
  }

  async update(id: number, input: Partial<Friend>): Promise<void> {
    const sets: string[] = []; const bindings: any[] = []
    if (input.name !== undefined) { sets.push('name = ?'); bindings.push(input.name) }
    if (input.url !== undefined) { sets.push('url = ?'); bindings.push(input.url) }
    if (input.avatar !== undefined) { sets.push('avatar = ?'); bindings.push(input.avatar) }
    if (input.description !== undefined) { sets.push('description = ?'); bindings.push(input.description) }
    if (input.sortOrder !== undefined) { sets.push('sort_order = ?'); bindings.push(input.sortOrder) }
    if (sets.length === 0) return
    bindings.push(id)
    await this.db.prepare(`UPDATE friends SET ${sets.join(', ')} WHERE id = ?`).bind(...bindings).run()
  }

  async delete(id: number): Promise<void> {
    await this.db.prepare('DELETE FROM friends WHERE id = ?').bind(id).run()
  }
}
```

- [ ] **Step 8: Write friends service**

```typescript
// src/server/services/friends.ts
import { FriendsRepository } from '@/server/repositories/friends'

export class FriendsService {
  constructor(private repo: FriendsRepository) {}
  async listFriends() { return this.repo.list() }
  async createFriend(input: Parameters<FriendsRepository['create']>[0]) { return this.repo.create(input) }
  async updateFriend(id: number, input: Parameters<FriendsRepository['update']>[1]) { return this.repo.update(id, input) }
  async deleteFriend(id: number) { return this.repo.delete(id) }
}
```

- [ ] **Step 9: Write stats service**

```typescript
// src/server/services/stats.ts
import type { SiteStats } from '@/types'

export class StatsService {
  constructor(private db: D1Database) {}

  async getStats(): Promise<SiteStats> {
    const totalPosts = await this.db.prepare(
      'SELECT COUNT(*) as count FROM posts WHERE is_published = 1'
    ).first<{ count: number }>()

    const totalViews = await this.db.prepare(
      'SELECT COALESCE(SUM(views), 0) as total FROM posts WHERE is_published = 1'
    ).first<{ total: number }>()

    const recentPosts = await this.db.prepare(
      `SELECT id, title, slug, summary, category, reading_time as readingTime, views, published_at as publishedAt
       FROM posts WHERE is_published = 1 ORDER BY published_at DESC LIMIT 5`
    ).all()

    const popularPosts = await this.db.prepare(
      `SELECT id, title, slug, summary, category, reading_time as readingTime, views, published_at as publishedAt
       FROM posts WHERE is_published = 1 ORDER BY views DESC LIMIT 5`
    ).all()

    return {
      totalViews: totalViews?.total ?? 0,
      totalPosts: totalPosts?.count ?? 0,
      recentPosts: recentPosts.results as any[],
      popularPosts: popularPosts.results as any[],
    }
  }
}
```

- [ ] **Step 10: Commit**

```bash
git add src/server/ && git commit -m "feat: add anime, wiki, essays, friends repositories and services"
```

---

## Phase 7: API Routes

### Task 15: Create public API routes

**Files:**
- Create: `src/app/api/v1/posts/route.ts`
- Create: `src/app/api/v1/posts/[slug]/route.ts`

- [ ] **Step 1: Write GET /api/v1/posts**

```typescript
// src/app/api/v1/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { PostsRepository } from '@/server/repositories/posts'
import { PostsService } from '@/server/services/posts'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { env } = getRequestContext()
  const repo = new PostsRepository((env as any).DB)
  const service = new PostsService(repo)

  const { searchParams } = new URL(request.url)
  const cursor = searchParams.get('cursor') ?? undefined
  const limit = parseInt(searchParams.get('limit') ?? '10', 10)
  const category = searchParams.get('category') ?? undefined
  const tag = searchParams.get('tag') ?? undefined
  const keyword = searchParams.get('keyword') ?? undefined

  try {
    const result = await service.listPosts({ cursor, limit, category, tag, keyword })
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: '获取文章列表失败' } },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: Write GET /api/v1/posts/[slug]**

```typescript
// src/app/api/v1/posts/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { PostsRepository } from '@/server/repositories/posts'
import { PostsService } from '@/server/services/posts'

export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { env } = getRequestContext()
  const repo = new PostsRepository((env as any).DB)
  const service = new PostsService(repo)

  try {
    const post = await service.getPost(params.slug)
    if (!post) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '文章不存在' } },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, data: post })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: '获取文章失败' } },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/ && git commit -m "feat: add public API routes for posts"
```

---

### Task 16: Create admin API routes

**Files:**
- Create: `src/app/api/v1/admin/posts/route.ts`
- Create: `src/app/api/v1/admin/upload/route.ts`

- [ ] **Step 1: Write admin posts CRUD**

```typescript
// src/app/api/v1/admin/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'
import { PostsRepository } from '@/server/repositories/posts'
import { PostsService } from '@/server/services/posts'
import { postSchema, updatePostSchema } from '@/schemas/posts'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  const { env } = getRequestContext()
  const repo = new PostsRepository((env as any).DB)
  const service = new PostsService(repo)

  try {
    const body = await request.json()
    const parsed = postSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION', message: parsed.error.errors[0]?.message ?? '数据校验失败' } },
        { status: 400 }
      )
    }

    const result = await service.createPost(parsed.data)
    return NextResponse.json({ success: true, data: result }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: '创建文章失败' } },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const { env } = getRequestContext()
  const repo = new PostsRepository((env as any).DB)
  const service = new PostsService(repo)

  try {
    const body = await request.json()
    const { slug, ...data } = body
    if (!slug) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION', message: '缺少 slug' } },
        { status: 400 }
      )
    }

    const parsed = updatePostSchema.safeParse(data)
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION', message: parsed.error.errors[0]?.message ?? '数据校验失败' } },
        { status: 400 }
      )
    }

    await service.updatePost(slug, parsed.data)
    return NextResponse.json({ success: true, data: { slug } })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: '更新文章失败' } },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const { env } = getRequestContext()
  const repo = new PostsRepository((env as any).DB)
  const service = new PostsService(repo)

  const { searchParams } = new URL(request.url)
  const slug = searchParams.get('slug')
  if (!slug) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION', message: '缺少 slug' } },
      { status: 400 }
    )
  }

  try {
    await service.deletePost(slug)
    return NextResponse.json({ success: true, data: null })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: '删除文章失败' } },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: Write upload route**

```typescript
// src/app/api/v1/admin/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  const { env } = getRequestContext()

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION', message: '未提供文件' } },
        { status: 400 }
      )
    }

    // Upload to Cloudflare Images
    const cfImages = (env as any).IMAGES
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${env.CF_ACCOUNT_ID}/images/v1`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.CF_API_TOKEN}`,
        },
        body: formData,
      }
    )

    const result = await response.json() as any
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: { code: 'UPLOAD_FAILED', message: '上传失败' } },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: { url: result.result.variants[0] },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL', message: '上传失败' } },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/ && git commit -m "feat: add admin API routes for posts CRUD and image upload"
```

---

## Phase 8: Public Pages — Blog

### Task 17: Create blog list page

**Files:**
- Create: `src/components/blog/PostCard.tsx`
- Create: `src/components/blog/CategoryFilter.tsx`
- Create: `src/app/(public)/blog/page.tsx`
- Create: `src/app/(public)/layout.tsx`

- [ ] **Step 1: Write PostCard.tsx**

```tsx
import { Card } from '@/components/ui/Card'
import { Tag } from '@/components/ui/Tag'
import { formatDateWithDot } from '@/utils/date'
import type { PostListItem } from '@/types'
import Link from 'next/link'

export function PostCard({ post }: { post: PostListItem }) {
  return (
    <Link href={`/blog/${post.slug}`} className="block group">
      <Card hover padding="md" className="transition-all duration-300 group-hover:translate-x-1">
        <div className="flex items-start gap-4">
          <span className="text-xs text-accent-red whitespace-nowrap mt-0.5 transition-all duration-300 group-hover:scale-110">
            ●
          </span>
          <div className="min-w-0 flex-1">
            <span className="text-xs text-text-secondary block mb-1">
              {formatDateWithDot(post.publishedAt)}
            </span>
            <h2 className="text-lg font-bold text-text-primary mb-2 group-hover:text-accent-red transition-colors line-clamp-2">
              {post.title}
            </h2>
            <p className="text-sm text-text-secondary line-clamp-2 mb-3">
              {post.summary || '（无摘要）'}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {post.tags?.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          </div>
          <span className="text-xs text-text-secondary/50 whitespace-nowrap">
            {post.readingTime} min
          </span>
        </div>
      </Card>
    </Link>
  )
}

export function PostCardSkeleton() {
  return (
    <Card padding="md">
      <div className="flex items-start gap-4">
        <div className="w-2 h-2 mt-0.5 rounded-full bg-text-secondary/10 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 bg-text-secondary/10 rounded animate-pulse" />
          <div className="h-5 w-3/4 bg-text-secondary/10 rounded animate-pulse" />
          <div className="h-4 w-full bg-text-secondary/10 rounded animate-pulse" />
        </div>
      </div>
    </Card>
  )
}
```

- [ ] **Step 2: Write CategoryFilter.tsx**

```tsx
'use client'

import { cn } from '@/utils/cn'

const CATEGORIES = [
  { key: '', label: '全部' },
  { key: 'tech', label: '技术' },
  { key: 'life', label: '生活' },
  { key: 'anime', label: '动漫' },
]

interface CategoryFilterProps {
  selected: string
  onSelect: (key: string) => void
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 flex-wrap">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.key}
          onClick={() => onSelect(cat.key)}
          className={cn(
            'px-4 py-1.5 rounded-full text-xs tracking-wide transition-all duration-200 border',
            selected === cat.key
              ? 'border-accent-red/40 text-accent-red bg-accent-red/5'
              : 'border-text-secondary/10 text-text-secondary hover:border-text-secondary/25 hover:text-text-primary'
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Write public layout**

```tsx
// src/app/(public)/layout.tsx
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-page mx-auto px-6 py-12">
      {children}
    </div>
  )
}
```

- [ ] **Step 4: Write blog list page**

```tsx
// src/app/(public)/blog/page.tsx
import { PostCard } from '@/components/blog/PostCard'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '博客',
  description: '技术 · 生活 · 动漫',
}

export default function BlogPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-2">博客</h1>
      <p className="text-sm text-text-secondary mb-8">技术 · 生活 · 动漫</p>

      {/* CategoryFilter and post list will be client-side hydrated */}
      <div id="blog-list-root" className="space-y-6">
        <p className="text-sm text-text-secondary">加载中...</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/blog/ src/app/\(public\)/ && git commit -m "feat: add blog list page with PostCard and CategoryFilter"
```

---

## Phase 9: Public Pages — Post Detail, Wiki, Anime, Essays, Friends

### Task 18: Create Markdown renderer

**Files:**
- Create: `src/components/blog/MarkdownRenderer.tsx`
- Create: `src/components/blog/CodeBlock.tsx`
- Create: `src/components/blog/AsideNote.tsx`
- Create: `src/components/blog/ProgressBar.tsx`
- Create: `src/components/blog/PostNav.tsx`

- [ ] **Step 1: Write CodeBlock.tsx**

```tsx
'use client'

import { useState } from 'react'
import { cn } from '@/utils/cn'

interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
}

export function CodeBlock({ code, language, filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="card my-6 overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-text-secondary/5 bg-text-secondary/[0.02]">
        <span className="text-xs text-text-secondary/60 font-mono">
          {filename ?? language ?? 'code'}
        </span>
        <button
          onClick={handleCopy}
          className={cn(
            'text-xs transition-colors font-mono',
            copied ? 'text-accent-green' : 'text-text-secondary/40 hover:text-text-secondary'
          )}
        >
          {copied ? '✓' : 'Copy'}
        </button>
      </div>
      {/* Code area */}
      <div className="overflow-x-auto">
        <pre className="text-sm font-mono leading-relaxed">
          <code className={cn(language && `language-${language}`)}>
            {code}
          </code>
        </pre>
      </div>
      <style jsx>{`
        pre {
          @apply p-4 m-0;
          background: transparent;
        }
        code {
          @apply text-text-primary/90;
        }
      `}</style>
    </div>
  )
}
```

- [ ] **Step 2: Write AsideNote.tsx**

```tsx
export function AsideNote({ children }: { children: React.ReactNode }) {
  return (
    <aside className="hidden lg:block absolute right-[-280px] top-0 w-[250px] bg-accent-amber/5 border border-accent-amber/10 rounded-journal p-4 text-xs text-text-secondary leading-relaxed">
      {children}
    </aside>
  )
}
```

- [ ] **Step 3: Write ProgressBar.tsx**

```tsx
'use client'

import { useEffect, useState } from 'react'

export function ProgressBar() {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      if (docHeight <= 0) { setWidth(100); return }
      setWidth(Math.min(100, (scrollTop / docHeight) * 100))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      className="fixed top-0 left-0 h-[1px] z-[60] transition-[width] duration-100 ease-linear"
      style={{ width: `${width}%`, backgroundColor: '#d4745c' }}
    />
  )
}
```

- [ ] **Step 4: Write PostNav.tsx**

```tsx
import Link from 'next/link'

interface PostNavProps {
  prev?: { slug: string; title: string } | null
  next?: { slug: string; title: string } | null
}

export function PostNav({ prev, next }: PostNavProps) {
  if (!prev && !next) return null

  return (
    <nav className="flex justify-between gap-4 mt-12 pt-8 border-t border-text-secondary/5">
      {prev ? (
        <Link
          href={`/blog/${prev.slug}`}
          className="group text-left flex-1"
        >
          <span className="text-xs text-text-secondary">← 上一篇</span>
          <p className="text-sm text-text-primary group-hover:text-accent-red transition-colors line-clamp-1">
            {prev.title}
          </p>
        </Link>
      ) : <div />}
      {next ? (
        <Link
          href={`/blog/${next.slug}`}
          className="group text-right flex-1"
        >
          <span className="text-xs text-text-secondary">下一篇 →</span>
          <p className="text-sm text-text-primary group-hover:text-accent-red transition-colors line-clamp-1">
            {next.title}
          </p>
        </Link>
      ) : <div />}
    </nav>
  )
}
```

- [ ] **Step 5: Write MarkdownRenderer.tsx skeleton**

```tsx
// src/components/blog/MarkdownRenderer.tsx
import { Divider } from '@/components/ui/Divider'

export function MarkdownRenderer({ content }: { content: string }) {
  // In production, this processes markdown server-side with unified/remark/rehype
  // For now, render as HTML (the markdown is pre-processed on the server)
  return (
    <article
      className="prose prose-invert max-w-none
        prose-headings:font-bold prose-headings:text-text-primary
        prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4
        prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
        prose-p:text-text-primary/85 prose-p:leading-[1.85]
        prose-a:text-accent-red prose-a:no-underline hover:prose-a:underline
        prose-strong:text-text-primary
        prose-blockquote:border-l-accent-red prose-blockquote:text-text-secondary prose-blockquote:not-italic
        prose-li:text-text-primary/85
        prose-code:font-mono prose-code:text-accent-amber
        prose-img:rounded-journal"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
```

- [ ] **Step 6: Commit**

```bash
git add src/components/blog/ && git commit -m "feat: add MarkdownRenderer, CodeBlock, AsideNote, ProgressBar, PostNav"
```

---

### Task 19: Create blog post detail page

**Files:**
- Create: `src/app/(public)/blog/[slug]/page.tsx`

- [ ] **Step 1: Write post detail page**

```tsx
// src/app/(public)/blog/[slug]/page.tsx
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer'
import { ProgressBar } from '@/components/blog/ProgressBar'
import { PostNav } from '@/components/blog/PostNav'
import { Tag } from '@/components/ui/Tag'
import { Divider } from '@/components/ui/Divider'
import { formatDateWithDot } from '@/utils/date'
import type { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // In production, fetch post from D1
  return {
    title: params.slug,
  }
}

export default function PostPage({ params }: Props) {
  // In production, this is a Server Component that fetches directly from the Service layer
  // For now, the client-side hydration will load data from API

  return (
    <>
      <ProgressBar />
      <article className="max-w-content mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            {/* title */}
          </h1>
          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <span className="text-accent-red">●</span>
            {/* date */}
            <span>{/* readingTime */} min read</span>
          </div>
          <div className="flex gap-1.5 mt-3">
            {/* tags */}
          </div>
        </header>

        <MarkdownRenderer content={''} />

        <Divider />
        <PostNav />
      </article>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/\(public\)/blog/\[slug\]/ && git commit -m "feat: add blog post detail page"
```

---

### Task 20: Create anime, wiki, essays, friends pages

**Files:**
- Create: `src/app/(public)/anime/page.tsx`
- Create: `src/app/(public)/wiki/page.tsx`
- Create: `src/app/(public)/wiki/[category]/page.tsx`
- Create: `src/app/(public)/wiki/[category]/[page]/page.tsx`
- Create: `src/app/(public)/essays/page.tsx`
- Create: `src/app/(public)/friends/page.tsx`

- [ ] **Step 1: Write anime page**

```tsx
// src/app/(public)/anime/page.tsx
import type { Metadata } from 'next'
import type { Anime } from '@/types'

export const metadata: Metadata = {
  title: '追番',
  description: '看过的那些动画',
}

// Status badge styles
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  watching:  { label: '在追', color: '#d4745c' },
  completed: { label: '追完', color: '#8aaa7a' },
  paused:    { label: '搁置', color: '#8b8680' },
  planned:   { label: '想看', color: '#7a9a8a' },
}

export default function AnimePage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-2">追番</h1>
      <p className="text-sm text-text-secondary mb-10">看过的那些动画</p>

      <div className="space-y-12">
        {/* Anime list grouped by year/season - hydrated client-side */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-text-primary">2026 · 夏</h2>
          <div className="grid gap-3 sm:grid-cols-2" id="anime-grid">
            <p className="text-sm text-text-secondary col-span-2">加载中...</p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Write wiki pages**

```tsx
// src/app/(public)/wiki/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '知识库',
}

export default function WikiPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-2">知识库</h1>
      <p className="text-sm text-text-secondary mb-10">笔记与知识整理</p>
      <div className="grid gap-4 sm:grid-cols-2" id="wiki-grid">
        <p className="text-sm text-text-secondary col-span-2">加载中...</p>
      </div>
    </div>
  )
}
```

```tsx
// src/app/(public)/wiki/[category]/page.tsx
export default function WikiCategoryPage({ params }: { params: { category: string } }) {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-2 capitalize">{params.category}</h1>
      <div className="space-y-2">
        <p className="text-sm text-text-secondary">加载中...</p>
      </div>
    </div>
  )
}
```

```tsx
// src/app/(public)/wiki/[category]/[page]/page.tsx
export default function WikiDetailPage({
  params,
}: {
  params: { category: string; page: string }
}) {
  return (
    <article className="max-w-content mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-8">{params.page}</h1>
      <div className="text-sm text-text-secondary">加载中...</div>
    </article>
  )
}
```

- [ ] **Step 3: Write essays page**

```tsx
// src/app/(public)/essays/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '杂谈',
  description: '随便写写',
}

export default function EssaysPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">杂谈</h1>
          <p className="text-sm text-text-secondary">随便写写</p>
        </div>
        <button className="text-xs text-text-secondary hover:text-accent-red transition-colors border border-text-secondary/15 rounded-journal px-3 py-1.5">
          随机一篇
        </button>
      </div>
      <div className="space-y-4" id="essays-list">
        <p className="text-sm text-text-secondary">加载中...</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Write friends page**

```tsx
// src/app/(public)/friends/page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '友链',
}

export default function FriendsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-2">友链</h1>
      <p className="text-sm text-text-secondary mb-10">朋友们的地方</p>
      <div className="grid gap-3 sm:grid-cols-2" id="friends-grid">
        <p className="text-sm text-text-secondary col-span-2">加载中...</p>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/\(public\)/ && git commit -m "feat: add anime, wiki, essays, friends pages"
```

---

## Phase 10: Admin Pages

### Task 21: Create admin layout and dashboard

**Files:**
- Create: `src/components/layout/AdminSidebar.tsx`
- Create: `src/components/dashboard/StatsCard.tsx`
- Create: `src/app/(admin)/layout.tsx`
- Create: `src/app/(admin)/page.tsx`

- [ ] **Step 1: Write AdminSidebar.tsx**

```tsx
'use client'

import { cn } from '@/utils/cn'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const ADMIN_NAV = [
  { href: '/admin', label: '仪表盘', icon: '◫' },
  { href: '/admin/posts', label: '文章管理', icon: '☷' },
  { href: '/admin/wiki', label: '知识库', icon: '☰' },
  { href: '/admin/anime', label: '追番管理', icon: '▶' },
  { href: '/admin/media', label: '媒体库', icon: '▣' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 min-h-[calc(100vh-3.5rem)] border-r border-text-secondary/5 bg-card/50 p-4">
      <nav className="flex flex-col gap-1">
        {ADMIN_NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-journal text-sm transition-all duration-200',
              pathname === item.href
                ? 'bg-accent-red/10 text-accent-red'
                : 'text-text-secondary hover:text-text-primary hover:bg-text-secondary/5'
            )}
          >
            <span className="text-xs w-5 text-center">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
```

- [ ] **Step 2: Write StatsCard.tsx**

```tsx
import { Card } from '@/components/ui/Card'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
}

export function StatsCard({ title, value, subtitle }: StatsCardProps) {
  return (
    <Card padding="md">
      <p className="text-xs text-text-secondary mb-2">{title}</p>
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      {subtitle && <p className="text-xs text-text-secondary/60 mt-1">{subtitle}</p>}
    </Card>
  )
}
```

- [ ] **Step 3: Write admin layout**

```tsx
// src/app/(admin)/layout.tsx
import { AdminSidebar } from '@/components/layout/AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8">{children}</main>
    </div>
  )
}
```

- [ ] **Step 4: Write admin dashboard**

```tsx
// src/app/(admin)/page.tsx
import { StatsCard } from '@/components/dashboard/StatsCard'

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-xl font-bold text-text-primary mb-6">仪表盘</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="文章数量" value="--" subtitle="已发布" />
        <StatsCard title="总浏览量" value="--" />
        <StatsCard title="追番数量" value="--" subtitle="在追 --" />
        <StatsCard title="知识库" value="--" subtitle="个分类" />
      </div>

      <div className="grid gap-6 mt-8 lg:grid-cols-2">
        <section>
          <h2 className="text-sm font-bold text-text-primary mb-3">最近发布</h2>
          <div className="space-y-2">
            <p className="text-xs text-text-secondary">加载中...</p>
          </div>
        </section>
        <section>
          <h2 className="text-sm font-bold text-text-primary mb-3">热门文章</h2>
          <div className="space-y-2">
            <p className="text-xs text-text-secondary">加载中...</p>
          </div>
        </section>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/AdminSidebar.tsx src/components/dashboard/ src/app/\(admin\)/ && git commit -m "feat: add admin layout, sidebar, and dashboard"
```

---

### Task 22: Create admin post editor and management pages

**Files:**
- Create: `src/components/dashboard/PostEditor.tsx`
- Create: `src/app/(admin)/posts/page.tsx`
- Create: `src/app/(admin)/posts/new/page.tsx`
- Create: `src/app/(admin)/posts/[id]/edit/page.tsx`
- Create: `src/app/(admin)/wiki/page.tsx`
- Create: `src/app/(admin)/anime/page.tsx`
- Create: `src/app/(admin)/media/page.tsx`

- [ ] **Step 1: Write PostEditor.tsx**

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface PostEditorProps {
  initialData?: {
    title?: string
    slug?: string
    content?: string
    summary?: string
    category?: string
    tags?: string[]
  }
  onSave: (data: any) => void
  isSaving?: boolean
}

export function PostEditor({ initialData, onSave, isSaving }: PostEditorProps) {
  const [title, setTitle] = useState(initialData?.title ?? '')
  const [content, setContent] = useState(initialData?.content ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [summary, setSummary] = useState(initialData?.summary ?? '')
  const [category, setCategory] = useState(initialData?.category ?? 'tech')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ title, slug, content, summary, category, tags: [] })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="文章标题"
          className="flex-1 bg-transparent text-xl font-bold text-text-primary placeholder:text-text-secondary/30 outline-none"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="bg-card border border-text-secondary/10 rounded-journal px-3 py-1.5 text-sm text-text-secondary"
        >
          <option value="tech">技术</option>
          <option value="life">生活</option>
          <option value="anime">动漫</option>
        </select>
      </div>

      <input
        type="text"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="文章 slug"
        className="w-full bg-transparent text-sm text-text-secondary placeholder:text-text-secondary/30 outline-none"
      />

      <textarea
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        placeholder="摘要（可选）"
        rows={2}
        className="w-full bg-transparent text-sm text-text-secondary placeholder:text-text-secondary/30 outline-none resize-none"
      />

      <div className="flex gap-0 h-[600px]">
        {/* Editor pane */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="开始写 Markdown..."
          className="flex-1 bg-card border border-text-secondary/5 rounded-journal p-6 text-sm text-text-primary font-mono resize-none outline-none"
        />
        {/* Preview pane */}
        <div className="flex-1 bg-card border border-text-secondary/5 rounded-journal p-6 text-sm text-text-primary/85 overflow-y-auto ml-0 border-l-0 rounded-l-none">
          {content ? (
            <div dangerouslySetInnerHTML={{ __html: content }} />
          ) : (
            <p className="text-text-secondary/30">预览</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" size="sm">
          保存草稿
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? '保存中...' : '发布'}
        </Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Write admin posts pages**

```tsx
// src/app/(admin)/posts/page.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function AdminPostsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-text-primary">文章管理</h1>
        <Link href="/admin/posts/new">
          <Button size="sm">+ 新建文章</Button>
        </Link>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-text-secondary">加载中...</p>
      </div>
    </div>
  )
}
```

```tsx
// src/app/(admin)/posts/new/page.tsx
'use client'

import { PostEditor } from '@/components/dashboard/PostEditor'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function NewPostPage() {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (data: any) => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/v1/admin/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        router.push('/admin/posts')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-text-primary mb-6">新建文章</h1>
      <PostEditor onSave={handleSave} isSaving={isSaving} />
    </div>
  )
}
```

```tsx
// src/app/(admin)/posts/[id]/edit/page.tsx
'use client'

import { PostEditor } from '@/components/dashboard/PostEditor'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function EditPostPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (data: any) => {
    setIsSaving(true)
    try {
      await fetch('/api/v1/admin/posts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: params.id, ...data }),
      })
      router.push('/admin/posts')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <h1 className="text-xl font-bold text-text-primary mb-6">编辑文章</h1>
      <PostEditor onSave={handleSave} isSaving={isSaving} />
    </div>
  )
}
```

- [ ] **Step 3: Write remaining admin pages (wiki, anime, media)**

```tsx
// src/app/(admin)/wiki/page.tsx
export default function AdminWikiPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-text-primary mb-6">知识库管理</h1>
      <p className="text-xs text-text-secondary">加载中...</p>
    </div>
  )
}
```

```tsx
// src/app/(admin)/anime/page.tsx
export default function AdminAnimePage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-text-primary mb-6">追番管理</h1>
      <p className="text-xs text-text-secondary">加载中...</p>
    </div>
  )
}
```

```tsx
// src/app/(admin)/media/page.tsx
import { MediaUploader } from '@/components/dashboard/MediaUploader'

export default function AdminMediaPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-text-primary mb-6">媒体库</h1>
      <MediaUploader />
    </div>
  )
}
```

- [ ] **Step 4: Create MediaUploader**

```tsx
// src/components/dashboard/MediaUploader.tsx
'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'

export function MediaUploader() {
  const [uploading, setUploading] = useState(false)
  const [url, setUrl] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/v1/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) setUrl(data.data.url)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? '上传中...' : '选择图片'}
      </Button>
      {url && (
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span className="text-accent-green">✓</span>
          上传成功:
          <code className="text-accent-amber bg-card px-2 py-0.5 rounded">{url}</code>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/ src/app/\(admin\)/ && git commit -m "feat: add admin post editor, management pages, and media uploader"
```

---

## Phase 11: CI/CD & Deployment

### Task 23: Create GitHub Actions workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Write CI/CD workflow**

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    needs: [lint, typecheck]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm test

  deploy:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    needs: [test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run pages:build
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          command: pages deploy .vercel/output/static --project-name=cittan-blog
```

- [ ] **Step 2: Commit**

```bash
git add .github/ && git commit -m "feat: add GitHub Actions CI/CD for Cloudflare Pages deploy"
```

---

## Phase 12: Verification & Polish

### Task 24: Run type check, lint, and build

- [ ] **Step 1: Install dependencies**

```bash
npm install
```

- [ ] **Step 2: Run type check**

```bash
npm run typecheck
```

Expected: No errors (may have some initially due to D1 types — fix with `npm i -D @cloudflare/workers-types`)

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

Expected: No errors.

- [ ] **Step 4: Run local dev and verify entry page renders**

```bash
npm run dev
```

Open http://localhost:3000 and verify:
- Entry page shows avatar, name "cittan", tagline, "进入博客 →" button
- Cursor parallax works
- Particles render in background
- Button links to /blog

- [ ] **Step 5: Commit any fixes**

```bash
git add -A && git commit -m "fix: type and lint fixes from verification"
```

---

## Summary

**Total tasks:** 24 tasks across 12 phases
**Total files:** ~60+ files
**Key deliverables:**
1. Entry page with cursor parallax and particle effects
2. Blog list + detail pages with markdown rendering
3. Anime tracking, wiki, essays, friends pages
4. Admin dashboard with post editor
5. Full API with service → repository → D1 backend
6. CI/CD pipeline to Cloudflare Pages
