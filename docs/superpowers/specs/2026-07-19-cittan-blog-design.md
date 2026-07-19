# cittan blog 设计规范

> 基于 SDD v3.0 工程设计规范，面向 Cloudflare Pages 部署

## 设计方向：「手帖」— 数字手账本

**核心隐喻**：一本在暗处摊开的活页手账，有标签、批注、手写感。内容类型多样（技术博客 + 动漫追番 + 个人杂谈 + 知识库 + 友链），手账的形式天然适合管理多种分类。

参考：
- 2x.nz — 极简、内容驱动
- nextjs.org — 精致排版、清晰导航层级

---

## 1. 视觉设计系统

### 1.1 色彩体系

| 角色 | 色值 | 用途 |
|------|------|------|
| 底色 | `#1e2128` | 页面背景，深灰蓝 |
| 卡片底 | `#252830` | 卡片、代码块背景 |
| 文字主色 | `#f0ebe3` | 正文、标题 |
| 文字次级 | `#8b8680` | 日期、辅助信息 |
| 印章红 | `#d4745c` | 强调色：链接、标签、重点标记、进度条（在追） |
| 标签蓝绿 | `#7a9a8a` | 分类标签、知识库入口 |
| 琥珀高亮 | `#e6b450` | hover 状态、代码块背景微光 |
| 成功绿 | `#8aaa7a` | 追番完成、Copy 按钮反馈 |
| 搁置灰 | `#8b8680` | 追番搁置状态 |

### 1.2 字体层级

| 角色 | 字体 | 大小 | 行高 |
|------|------|------|------|
| 首页大标题 | 霞鹜文楷 Bold | 28-32px | 1.4 |
| 文章标题 | 霞鹜文楷 Bold | 20-22px | 1.5 |
| 小节标题 | 霞鹜文楷 Bold | 16-18px | 1.5 |
| 正文 | 霞鹜文楷 Light | 15px | 1.85 |
| 小字/日期/标签 | 霞鹜文楷 Light | 11-12px | 1.5 |
| 代码 | JetBrains Mono | 14px | 1.6 |

字体来源：霞鹜文楷（LXGW WenKai）— Google Fonts / 自托管子集；JetBrains Mono — Google Fonts。

### 1.3 间距体系

```
基础单位: 4px
页面边距: 24px (mobile) → 48px (desktop)
卡片内边距: 20px (小卡) / 28px (大卡)
卡片间距: 16px
段落间距: 1.5em
模块间距: 80-120px
内容最大宽: 680px (文章阅读)
页面最大宽: 1200px
```

### 1.4 标志性质感

- 卡片边框：`1px solid rgba(240, 235, 227, 0.06)` — 极淡暖色
- 分割线：`——— ※ ———` 居中装饰短横，不用全宽 `<hr>`
- 标签：小圆角底色块，像手账贴纸
- 日期格式：`● YYYY.MM.DD`，前面带红色圆点

---

## 2. 页面结构

### 2.1 全局布局

```
┌──────────────────────────────────────────┐
│  Header (sticky, backdrop-blur)           │
│  [● cittan] [博客] [知识库] [追番] [杂谈] [友链] [搜索]  │
├──────────────────────────────────────────┤
│  页面内容区  max-width: 1200px 居中         │
├──────────────────────────────────────────┤
│  Footer  RSS · GitHub · 署名              │
└──────────────────────────────────────────┘
```

### 2.2 入口首页 `/`

- 居中布局：头像（80-100px 圆形 + 暖色光环）+ 博客名 "cittan" + 描述「只会vibe coding的fw一个」+ "进入博客 →" 按钮
- 背景：深灰蓝 + 中央径向暖光渐变
- 按钮：透明底 + 1px 暖色边框 + 6px 圆角，hover 边框和文字 → 印章红，scale(1.03)

**鼠标交互动效：**
- 视差跟随：头像向鼠标位移 8-12px，名字位移 4-6px
- 光环响应：头像光环中心随鼠标偏移
- 背景光：中央径向渐变中心随鼠标微移 ±20px
- 可选粒子：5-10 个暖色粒子漂浮，鼠标附近被推开

**移动端：** 头像 64px，名字 22px，呼吸光环动画 + 按钮脉冲边框

### 2.3 博客列表页 `/blog`

- 分类筛选 pill 按钮组（全部 / 技术 / 生活 / 动漫）
- 文章卡片纵向列表，每张：`● 日期` + 标题 + 摘要 + 标签
- hover: 整行微右移 + 红点变大
- 游标分页（"加载更多"）

### 2.4 文章详情页 `/blog/[slug]`

- 顶部：大标题 + 日期 + 阅读时间 + 标签
- Markdown 正文 680px 居中
- 代码块：Shiki 高亮 + 深底 + 圆角 8px + 顶部文件名标签 + Copy 按钮
- `<aside>` 渲染为右侧黄色便签批注（桌面端）
- 底部：`——— ※ ———` + 上一篇/下一篇导航
- 阅读进度：页面顶部 1px 印章红线

### 2.5 追番页 `/anime`

- 时间线布局，按年份/季度分组
- 每部番卡片：封面缩略图 + 标题 + 进度条 + 状态标签
- 状态配色：在追=印章红，追完=绿，搁置=灰

### 2.6 知识库 `/wiki`

- 分类卡片网格，每个分类一张卡
- 卡片内列出子页面链接
- 子页面 Markdown 渲染

### 2.7 杂谈 `/essays`

- 类似博客列表，更休闲
- 卡片展示标题 + 日期 + 片段（前 100 字）
- "随机一篇"按钮

### 2.8 管理后台 `/admin`

- 左侧导航：仪表盘 / 文章 / 知识库 / 追番 / 媒体
- 仪表盘：4 统计卡（文章数/浏览量/最近发布/热门）
- 编辑器：左 Markdown + 右实时预览分栏

---

## 3. 组件树

```
Layout
├── Header
│   ├── LogoLink
│   ├── NavLinks
│   ├── SearchButton
│   └── MobileMenu
├── Content
│   ├── EntryPage
│   │   ├── AvatarGlow, SiteTitle, Tagline, EnterButton, Particles
│   ├── BlogList
│   │   ├── CategoryFilter, PostCard[], LoadMore
│   ├── PostDetail
│   │   ├── PostHeader, MarkdownRenderer
│   │   │   ├── CodeBlock, MermaidDiagram, KatexFormula, AsideNote
│   │   ├── ProgressBar, PostNav
│   ├── AnimeTimeline
│   │   ├── SeasonGroup[], AnimeCard
│   ├── WikiGrid
│   │   └── WikiCategoryCard[]
│   ├── EssaysList
│   └── AdminLayout
│       ├── AdminSidebar
│       └── AdminContent (DashboardStats, PostEditor, MediaUploader)
└── Footer
```

---

## 4. 状态管理

| 层级 | 工具 | 职责 |
|------|------|------|
| 服务端数据 | TanStack Query | 文章列表/详情、追番、知识库、友链、统计。游标分页。 |
| 客户端共享 | Zustand | searchOpen, mobileMenuOpen, entryAnimationDone |
| 认证/主题 | React Context | SessionProvider, ThemeProvider |
| 组件局部 | useState | 表单输入、hover、copy 反馈、筛选选中 |

---

## 5. 数据流

```
Server Component → Service → Repository → D1  (首屏 SSR)
Client Component → API Route → TanStack Query → Service → Repository → D1  (交互)
表单提交 / 图片上传 → Server Action → Cloudflare Images API → D1 保存 URL
```

---

## 6. 路由

```
/                          Static      入口首页
/blog                      ISR 300s    文章列表
/blog/[slug]               SSG + ISR   文章详情
/wiki                      SSG         知识库首页
/wiki/[category]           SSG         知识库分类
/wiki/[category]/[page]    SSG         知识库单页
/anime                     ISR 600s    追番时间线
/essays                    ISR 600s    杂谈列表
/essays/[slug]             SSG + ISR   杂谈详情
/friends                   SSG         友链页
/search                    CSR         搜索结果
/rss.xml                   Static      RSS Feed
/admin/**                  CSR         管理后台（需认证）
/api/v1/posts              -           API
/api/v1/admin/**           -           Admin API（需认证）
```

---

## 7. 部署

- 平台：Cloudflare Pages + `@cloudflare/next-on-pages`
- 数据库：Cloudflare D1
- 图片：Cloudflare Images（第一阶段），后续可加 R2
- CI/CD：GitHub Actions → Lint → Type Check → Test → Deploy
- 性能目标：Performance ≥ 90, SEO ≥ 95, Accessibility ≥ 95

---

## 8. Markdown 扩展

- GFM 基础
- Shiki 代码高亮
- Mermaid 流程图
- KaTeX 公式
- 图片懒加载
- Copy Code Button
- Heading Anchor
- 侧边批注 (`<aside>` → 便签样式)
