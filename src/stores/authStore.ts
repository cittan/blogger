'use client'

import { create } from 'zustand'

interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  checkAuth: () => boolean
  login: (secret: string) => Promise<boolean>
  logout: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: false,
  error: null,

  checkAuth: () => {
    if (typeof window === 'undefined') return false
    const stored = sessionStorage.getItem('admin_auth')
    const auth = stored === 'true'
    set({ isAuthenticated: auth })
    return auth
  },

  login: async (secret: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/v1/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret }),
      })
      const json = (await res.json()) as { success: boolean }
      if (json.success) {
        sessionStorage.setItem('admin_auth', 'true')
        set({ isAuthenticated: true, isLoading: false })
        return true
      }
      set({ error: '密钥错误', isLoading: false })
      return false
    } catch {
      set({ error: '网络错误，请重试', isLoading: false })
      return false
    }
  },

  logout: () => {
    sessionStorage.removeItem('admin_auth')
    set({ isAuthenticated: false, error: null })
  },

  clearError: () => set({ error: null }),
}))
