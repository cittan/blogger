'use client'

import { useState, useEffect } from 'react'

export function AnimatedViews({ views }: { views: number }) {
  const [displayViews, setDisplayViews] = useState(0)

  useEffect(() => {
    if (views === 0) return

    const duration = 1500
    const steps = 30
    const stepDuration = duration / steps
    let currentStep = 0

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

    const timer = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      const easedProgress = easeOutCubic(progress)
      const currentValue = Math.round(easedProgress * views)

      setDisplayViews(currentValue)

      if (currentStep >= steps) {
        clearInterval(timer)
        setDisplayViews(views)
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [views])

  return <span>{displayViews} 次浏览</span>
}
