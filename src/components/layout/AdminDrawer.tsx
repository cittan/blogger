'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/authStore'

export function AdminDrawer() {
  const [open, setOpen] = useState(false)
  const [secret, setSecret] = useState('')
  const router = useRouter()
  const { isAuthenticated, isLoading, error, login, logout, clearError, checkAuth } = useAuthStore()

  const handleOpen = () => {
    checkAuth()
    setOpen(true)
  }

  const handleSubmit = async () => {
    if (!secret.trim()) return
    const ok = await login(secret.trim())
    if (ok) {
      setSecret('')
      setOpen(false)
      router.push('/admin')
    } else {
      setSecret('')
    }
  }

  const handleClose = () => {
    setOpen(false)
    setSecret('')
    clearError()
  }

  return (
    <>
      {/* Trigger: circle button */}
      <button
        onClick={handleOpen}
        className="text-text-secondary hover:text-text-primary transition-colors text-sm"
        aria-label="管理"
      >
        ○
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[100] bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />

            {/* Drawer */}
            <motion.div
              className="fixed right-0 top-0 h-full w-80 max-w-[90vw] bg-card border-l border-text-secondary/10 z-[101] p-6 flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                className="self-end text-text-secondary hover:text-text-primary transition-colors mb-8 text-lg"
                aria-label="关闭"
              >
                ✕
              </button>

              {/* Search section (original ○ functionality) */}
              <p className="text-sm text-text-secondary mb-6">搜索功能即将上线</p>

              {/* Divider */}
              <hr className="border-text-secondary/10 mb-6" />

              {/* Tools section */}
              <button
                onClick={() => { setOpen(false); router.push('/toJpg') }}
                className="w-full px-4 py-2 rounded-journal border border-text-secondary/20 text-text-secondary text-sm hover:text-accent-red hover:border-accent-red/30 transition-colors mb-6 text-left"
              >
                WebP → JPG 转换
              </button>

              {/* Admin auth section */}
              <h3 className="text-sm font-bold text-text-primary mb-4">管理员入口</h3>

              {isAuthenticated ? (
                <div className="space-y-3">
                  <p className="text-xs text-accent-green">✓ 已认证</p>
                  <button
                    onClick={() => { setOpen(false); router.push('/admin') }}
                    className="w-full px-4 py-2 rounded-journal bg-accent-red text-white text-sm hover:bg-accent-red/85 transition-colors"
                  >
                    进入管理后台
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setOpen(false); router.push('/admin/wiki') }}
                      className="flex-1 px-3 py-2 rounded-journal border border-text-secondary/20 text-text-secondary text-xs hover:text-text-primary transition-colors"
                    >
                      Wiki 页面
                    </button>
                    <button
                      onClick={() => { setOpen(false); router.push('/admin/wiki/categories') }}
                      className="flex-1 px-3 py-2 rounded-journal border border-text-secondary/20 text-text-secondary text-xs hover:text-text-primary transition-colors"
                    >
                      Wiki 分类
                    </button>
                  </div>
                  <button
                    onClick={() => { logout(); setSecret('') }}
                    className="w-full px-4 py-2 rounded-journal border border-text-secondary/20 text-text-secondary text-sm hover:text-text-primary transition-colors"
                  >
                    退出登录
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <input
                    type="password"
                    value={secret}
                    onChange={(e) => { setSecret(e.target.value); clearError() }}
                    placeholder="请输入密钥"
                    className={`w-full bg-bg border ${error ? 'border-accent-red' : 'border-text-secondary/10'} rounded-journal px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/30 outline-none transition-colors`}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  />
                  {error && (
                    <p className="text-xs text-accent-red">{error}</p>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="w-full px-4 py-2 rounded-journal bg-accent-red text-white text-sm hover:bg-accent-red/85 transition-colors disabled:opacity-40"
                  >
                    {isLoading ? '验证中...' : '确定'}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
