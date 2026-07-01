'use client'
import { useEffect, useRef } from 'react'

export default function FishBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId
    let mouseX = -1000
    let mouseY = -1000

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const FISH_COUNT = 35
    const fish = Array.from({ length: FISH_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 16 + 10,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: -(Math.random() * 0.35 + 0.15),
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.03 + 0.01,
      opacity: Math.random() * 0.09 + 0.06,
      fleeing: false,
      canFlee: 'ontouchstart' in window === false,
    }))

    const drawFish = (f) => {
      ctx.save()
      ctx.globalAlpha = f.opacity
      ctx.translate(f.x, f.y)

      const angle = Math.atan2(f.speedY, f.speedX)
      ctx.rotate(angle)

      ctx.fillStyle = '#10b981'
      ctx.strokeStyle = '#059669'
      ctx.lineWidth = 0.5

      // Body
      ctx.beginPath()
      ctx.ellipse(0, 0, f.size, f.size * 0.42, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.stroke()

      // Tail
      ctx.beginPath()
      ctx.moveTo(-f.size * 0.9, 0)
      ctx.lineTo(-f.size * 1.6, -f.size * 0.45)
      ctx.lineTo(-f.size * 1.6, f.size * 0.45)
      ctx.closePath()
      ctx.fill()
      ctx.stroke()

      // Fin on top
      ctx.beginPath()
      ctx.moveTo(-f.size * 0.1, -f.size * 0.42)
      ctx.lineTo(f.size * 0.2, -f.size * 0.85)
      ctx.lineTo(f.size * 0.5, -f.size * 0.42)
      ctx.closePath()
      ctx.globalAlpha = f.opacity * 0.7
      ctx.fill()

      // Eye
      ctx.globalAlpha = f.opacity * 2.5
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.beginPath()
      ctx.arc(f.size * 0.38, -f.size * 0.08, f.size * 0.14, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    const MOUSE_RADIUS = 140
    const MAX_FLEE_SPEED = 4.0

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      fish.forEach(f => {
        f.wobble += f.wobbleSpeed

        const dx = f.x - mouseX
        const dy = f.y - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (f.canFlee && dist < MOUSE_RADIUS) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS
          f.speedX += (dx / dist) * force * 0.6
          f.speedY += (dy / dist) * force * 0.6
          f.fleeing = true
        } else {
          f.speedX += (Math.sin(f.wobble) * 0.15 - f.speedX) * 0.03
          f.speedY += (-0.35 - f.speedY) * 0.01
          f.fleeing = false
        }

        // Fish-fish collisions
        fish.forEach(other => {
          if (other === f) return
          const odx = f.x - other.x
          const ody = f.y - other.y
          const odist = Math.sqrt(odx * odx + ody * ody)
          const minDist = f.size + other.size
          if (odist < minDist && odist > 0) {
            const nx = odx / odist
            const ny = ody / odist
            const overlap = minDist - odist
            f.x += nx * overlap * 0.5
            f.y += ny * overlap * 0.5
            other.x -= nx * overlap * 0.5
            other.y -= ny * overlap * 0.5
            const relVx = f.speedX - other.speedX
            const relVy = f.speedY - other.speedY
            const dot = relVx * nx + relVy * ny
            if (dot < 0) {
              f.speedX -= dot * nx
              f.speedY -= dot * ny
              other.speedX += dot * nx
              other.speedY += dot * ny
            }
          }
        })

        // Speed cap
        const speed = Math.sqrt(f.speedX * f.speedX + f.speedY * f.speedY)
        const maxSpeed = f.fleeing ? MAX_FLEE_SPEED : 1.0
        if (speed > maxSpeed) {
          f.speedX = (f.speedX / speed) * maxSpeed
          f.speedY = (f.speedY / speed) * maxSpeed
        }

        f.x += f.speedX
        f.y += f.speedY

        if (f.y < -20) {
          f.y = canvas.height + 20
          f.x = Math.random() * canvas.width
          f.speedX = (Math.random() - 0.5) * 0.3
          f.speedY = -(Math.random() * 0.35 + 0.15)
        }
        if (f.x < -20) f.x = canvas.width + 20
        if (f.x > canvas.width + 20) f.x = -20

        drawFish(f)
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    const onMouseMove = (e) => { mouseX = e.clientX; mouseY = e.clientY }
    const onMouseLeave = () => { mouseX = -1000; mouseY = -1000 }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  )
}