'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, checkAuth } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    const auth = checkAuth()
    if (!auth) {
      router.replace('/')
    }
  }, [checkAuth, router])

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-sm text-text-secondary">
          需要认证，请从首页圆形按钮输入密钥进入管理端
        </p>
      </div>
    )
  }

  return <>{children}</>
}
