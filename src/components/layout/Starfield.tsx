'use client'

import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  size: number
  baseAlpha: number
  alpha: number
  twinkleSpeed: number
  twinkleOffset: number
  layer: number // 0=far, 1=mid, 2=near
}

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const targetMouseRef = useRef({ x: 0, y: 0 })

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

    // Generate stars
    const starCount = 150
    starsRef.current = Array.from({ length: starCount }, () => {
      const layer = Math.floor(Math.random() * 3) // 0, 1, 2
      const sizeMap = [0.4, 0.9, 1.5]
      const alphaMap = [0.15, 0.3, 0.55]
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: sizeMap[layer] * (0.5 + Math.random()),
        baseAlpha: alphaMap[layer] * (0.6 + Math.random() * 0.4),
        alpha: 0,
        twinkleSpeed: 0.003 + Math.random() * 0.015,
        twinkleOffset: Math.random() * Math.PI * 2,
        layer,
      }
    })

    // Mouse tracking with smooth lerp
    const handleMouse = (e: MouseEvent) => {
      targetMouseRef.current = { x: e.clientX, y: e.clientY }
    }
    window.addEventListener('mousemove', handleMouse)

    let time = 0
    let animId: number

    const animate = () => {
      time += 1
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Smooth mouse follow
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.02
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.02

      const mx = mouseRef.current.x / canvas.width - 0.5
      const my = mouseRef.current.y / canvas.height - 0.5

      starsRef.current.forEach((s) => {
        // Twinkling
        s.alpha = s.baseAlpha * (
          0.7 + 0.3 * Math.sin(time * s.twinkleSpeed + s.twinkleOffset)
        )

        // Parallax drift based on layer and mouse
        const parallaxX = mx * s.layer * 15
        const parallaxY = my * s.layer * 15
        const drawX = s.x + parallaxX
        const drawY = s.y + parallaxY

        // Wrap around
        const wx = ((drawX % canvas.width) + canvas.width) % canvas.width
        const wy = ((drawY % canvas.height) + canvas.height) % canvas.height

        ctx.beginPath()
        ctx.arc(wx, wy, s.size, 0, Math.PI * 2)

        // Mix colors: mostly warm white, some amber, occasional blue-white
        if (s.layer === 2 && s.size > 1.2) {
          // Bright stars: warm amber
          ctx.fillStyle = `rgba(230, 180, 80, ${s.alpha})`
        } else if (Math.random() < 0.05) {
          // Rare blue-white stars
          ctx.fillStyle = `rgba(180, 200, 240, ${s.alpha * 0.8})`
        } else {
          // Most stars: warm white
          ctx.fillStyle = `rgba(240, 235, 227, ${s.alpha})`
        }
        ctx.fill()

        // Glow for bright stars
        if (s.layer === 2 && s.size > 1.2) {
          ctx.beginPath()
          ctx.arc(wx, wy, s.size * 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(230, 180, 80, ${s.alpha * 0.15})`
          ctx.fill()
        }
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
