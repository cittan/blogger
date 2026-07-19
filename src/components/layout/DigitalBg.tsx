'use client'

import { useEffect, useRef } from 'react'

interface DataNode {
  x: number
  y: number
  size: number
  alpha: number
  pulsePhase: number
  pulseSpeed: number
  gridX: number
  gridY: number
}

interface ScanLine {
  y: number
  speed: number
  alpha: number
}

export function DigitalBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const nodesRef = useRef<DataNode[]>([])
  const scanLinesRef = useRef<ScanLine[]>([])
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

    // --- Data nodes on a grid ---
    const gridSize = 60
    const cols = Math.ceil(canvas.width / gridSize)
    const rows = Math.ceil(canvas.height / gridSize)
    const nodeCount = cols * rows
    nodesRef.current = Array.from({ length: nodeCount }, (_, i) => {
      const gridX = (i % cols) * gridSize + (Math.random() - 0.5) * 20
      const gridY = Math.floor(i / cols) * gridSize + (Math.random() - 0.5) * 20
      return {
        x: gridX,
        y: gridY,
        size: 1 + Math.random() * 1.8,
        alpha: 0.04 + Math.random() * 0.10,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.01 + Math.random() * 0.04,
        gridX,
        gridY,
      }
    })

    // --- Scan lines ---
    scanLinesRef.current = Array.from({ length: 6 }, () => ({
      y: Math.random() * canvas.height,
      speed: 0.15 + Math.random() * 0.5,
      alpha: 0.02 + Math.random() * 0.05,
    }))

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
      mouseRef.current.x += (targetMouseRef.current.x - mouseRef.current.x) * 0.03
      mouseRef.current.y += (targetMouseRef.current.y - mouseRef.current.y) * 0.03
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      // --- Draw dot matrix grid ---
      ctx.fillStyle = 'rgba(240, 235, 227, 0.018)'
      const dotSpacing = 20
      for (let x = dotSpacing; x < canvas.width; x += dotSpacing) {
        for (let y = dotSpacing; y < canvas.height; y += dotSpacing) {
          ctx.fillRect(x, y, 0.5, 0.5)
        }
      }

      // --- Draw scan lines ---
      scanLinesRef.current.forEach((sl) => {
        sl.y += sl.speed
        if (sl.y > canvas.height) sl.y = -2
        ctx.fillStyle = `rgba(122, 154, 138, ${sl.alpha})`
        ctx.fillRect(0, sl.y, canvas.width, 1)
      })

      // --- Draw data nodes ---
      nodesRef.current.forEach((n) => {
        // Pulse
        const pulse = 0.6 + 0.4 * Math.sin(time * n.pulseSpeed + n.pulsePhase)
        const alpha = n.alpha * pulse

        // Proximity to mouse increases brightness
        const dx = n.x - mx
        const dy = n.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        const proximityBoost = dist < 180 ? ((180 - dist) / 180) * 0.25 : 0

        const finalAlpha = alpha + proximityBoost
        const finalSize = n.size + (dist < 180 ? ((180 - dist) / 180) * 1.5 : 0)

        // Cross shape for data nodes (like + sign)
        const s = finalSize
        ctx.fillStyle = `rgba(122, 154, 138, ${finalAlpha})`
        ctx.fillRect(n.x - s, n.y - 0.5, s * 2, 1)
        ctx.fillRect(n.x - 0.5, n.y - s, 1, s * 2)

        // Outer ring for proximity nodes
        if (dist < 120) {
          ctx.beginPath()
          ctx.arc(n.x, n.y, s * 3, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(122, 154, 138, ${finalAlpha * 0.3})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      })

      // --- Draw perspective floor grid ---
      const horizonY = canvas.height * 0.55
      const vanishX = canvas.width / 2
      const gridDepth = 30
      const gridWidth = 40

      ctx.strokeStyle = 'rgba(240, 235, 227, 0.025)'
      ctx.lineWidth = 0.5
      ctx.beginPath()

      // Horizontal lines (going toward horizon)
      for (let i = 1; i <= gridDepth; i++) {
        const t = i / gridDepth
        const perspective = Math.pow(t, 1.8)
        const y = horizonY + perspective * (canvas.height - horizonY)
        ctx.moveTo(0, y)
        ctx.lineTo(canvas.width, y)
      }

      // Vertical lines (converging to vanishing point)
      for (let i = -gridWidth; i <= gridWidth; i++) {
        const t = i / gridWidth
        const xTop = vanishX + t * 300
        const xBottom = vanishX + t * canvas.width * 2
        ctx.moveTo(xTop, horizonY)
        ctx.lineTo(xBottom, canvas.height)
      }
      ctx.stroke()

      // --- Draw data flow lines (horizontal paths between nodes) ---
      if (time % 3 === 0) {
        ctx.fillStyle = 'rgba(212, 116, 92, 0.06)'
        const randomNodes = nodesRef.current
          .filter(() => Math.random() < 0.03)
          .slice(0, 8)

        randomNodes.forEach((n) => {
          ctx.beginPath()
          ctx.arc(n.x, n.y, n.size * 5, 0, Math.PI * 2)
          ctx.fill()
        })
      }

      // --- Corner HUD elements ---
      const hudAlpha = 0.06
      const cornerSize = 40
      const cornerMargin = 30

      // Top-left corner
      ctx.strokeStyle = `rgba(122, 154, 138, ${hudAlpha})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(cornerMargin, cornerMargin + cornerSize)
      ctx.lineTo(cornerMargin, cornerMargin)
      ctx.lineTo(cornerMargin + cornerSize, cornerMargin)
      ctx.stroke()

      // Top-right corner
      ctx.beginPath()
      ctx.moveTo(canvas.width - cornerMargin - cornerSize, cornerMargin)
      ctx.lineTo(canvas.width - cornerMargin, cornerMargin)
      ctx.lineTo(canvas.width - cornerMargin, cornerMargin + cornerSize)
      ctx.stroke()

      // Bottom-left corner
      ctx.beginPath()
      ctx.moveTo(cornerMargin, cornerMargin + cornerSize)
      ctx.lineTo(cornerMargin, canvas.height - cornerMargin - cornerSize)
      ctx.stroke()

      // Bottom-right corner
      ctx.beginPath()
      ctx.moveTo(canvas.width - cornerMargin, cornerMargin + cornerSize)
      ctx.lineTo(canvas.width - cornerMargin, canvas.height - cornerMargin - cornerSize)
      ctx.stroke()

      // --- Hexagonal accent rings (slow rotating) ---
      for (let i = 0; i < 3; i++) {
        const hx = canvas.width * (0.2 + i * 0.3)
        const hy = canvas.height * (0.3 + (i % 2) * 0.4)
        const hr = 80 + i * 40
        const rotation = time * 0.001 * (i + 1)

        ctx.strokeStyle = `rgba(122, 154, 138, ${0.02 + i * 0.01})`
        ctx.lineWidth = 0.5
        ctx.beginPath()
        for (let j = 0; j < 6; j++) {
          const angle = (j / 6) * Math.PI * 2 + rotation
          const x = hx + Math.cos(angle) * hr
          const y = hy + Math.sin(angle) * hr
          if (j === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.closePath()
        ctx.stroke()
      }

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
