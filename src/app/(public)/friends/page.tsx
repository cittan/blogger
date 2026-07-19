'use client'

import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { useFriends } from '@/hooks/useApi'

export default function FriendsPage() {
  const { data: friends, isLoading, isError } = useFriends()
  const list = friends ?? []

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-text-primary mb-2">友链</h1>
      <p className="text-sm text-text-secondary mb-10">朋友们的地方</p>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-accent-red">加载失败。</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-text-secondary">还没有友链。</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((friend) => (
            <a
              key={friend.id}
              href={friend.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Card padding="sm" hover className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-text-secondary/10 flex-shrink-0 flex items-center justify-center text-xs text-text-secondary/40 overflow-hidden">
                  {friend.avatar ? (
                    <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                  ) : (
                    friend.name[0]
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-text-primary">{friend.name}</p>
                  {friend.description && (
                    <p className="text-xs text-text-secondary truncate">{friend.description}</p>
                  )}
                </div>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
