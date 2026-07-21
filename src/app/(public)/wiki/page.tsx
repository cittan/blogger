'use client'

import { useState } from 'react'
import { useWikiCategoryTree, useWikiPageBySlug } from '@/hooks/useApi'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Input } from '@/components/ui/Input'
import { MarkdownRenderer } from '@/components/blog/MarkdownRenderer'
import type { WikiCategoryTree } from '@/types'

export default function WikiPage() {
  const { data: tree, isLoading } = useWikiCategoryTree()
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const { data: page, isLoading: pageLoading } = useWikiPageBySlug(selectedSlug || '')

  const filterTree = (nodes: WikiCategoryTree[], keyword: string): WikiCategoryTree[] => {
    if (!keyword) return nodes
    return nodes
      .map((node) => {
        const filteredPages = node.pages.filter((p) =>
          p.title.toLowerCase().includes(keyword.toLowerCase())
        )
        const filteredChildren = filterTree(node.children, keyword)
        if (filteredPages.length === 0 && filteredChildren.length === 0) return null
        return { ...node, pages: filteredPages, children: filteredChildren }
      })
      .filter(Boolean) as WikiCategoryTree[]
  }

  const filteredTree = filterTree(tree || [], searchKeyword)

  const renderCategoryTree = (nodes: WikiCategoryTree[], level = 0) => {
    return nodes.map((node) => (
      <div key={node.id} className={level > 0 ? 'ml-4' : ''}>
        <div className="flex items-center gap-2 py-1">
          <span className="text-accent-teal text-xs">▼</span>
          <span className="text-sm font-medium text-text-primary">{node.name}</span>
        </div>
        {node.pages.length > 0 && (
          <div className="ml-4 space-y-1">
            {node.pages.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedSlug(p.slug)}
                className={`block w-full text-left px-2 py-1 text-xs rounded transition-colors ${
                  selectedSlug === p.slug
                    ? 'bg-accent-teal/10 text-accent-teal'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
                }`}
              >
                {p.title}
              </button>
            ))}
          </div>
        )}
        {node.children.length > 0 && renderCategoryTree(node.children, level + 1)}
      </div>
    ))
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-6">知识库</h1>

      <div className="flex gap-6">
        {/* 左侧分类树 */}
        <div className="w-1/5 min-w-[200px]">
          <Card padding="md">
            <div className="mb-4">
              <Input
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索..."
                className="text-xs"
              />
            </div>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-6" />
                ))}
              </div>
            ) : filteredTree.length === 0 ? (
              <p className="text-xs text-text-secondary">暂无内容</p>
            ) : (
              <div className="space-y-2">{renderCategoryTree(filteredTree)}</div>
            )}
          </Card>
        </div>

        {/* 右侧内容区 */}
        <div className="flex-1">
          {!selectedSlug ? (
            <Card padding="lg">
              <p className="text-sm text-text-secondary text-center">请从左侧选择一个页面</p>
            </Card>
          ) : pageLoading ? (
            <Card padding="lg">
              <Skeleton className="h-8 w-1/3 mb-4" />
              <Skeleton className="h-4 mb-2" />
              <Skeleton className="h-4 mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </Card>
          ) : page ? (
            <Card padding="lg">
              <h2 className="text-xl font-bold text-text-primary mb-2">{page.title}</h2>
              <p className="text-xs text-text-secondary mb-6">
                最后更新：{new Date(page.updatedAt).toLocaleString('zh-CN')}
              </p>
              <MarkdownRenderer content={page.content} />
            </Card>
          ) : (
            <Card padding="lg">
              <p className="text-sm text-text-secondary text-center">页面不存在</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
