"use client"

import { useEffect, useRef, useState } from "react"

interface Particle {
  x: number
  y: number
  targetX: number
  targetY: number
  baseX: number
  baseY: number
  size: number
  opacity: number
  rotation: number
  rotationSpeed: number
  speed: number
  wanderAngle: number
  wanderRadius: number
  centerInfluence: number
}

interface HexagonParticlesProps {
  isPaused: boolean
}

export function HexagonParticles({ isPaused }: HexagonParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Initialize particles
  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)

    // Create particles with more randomness
    particlesRef.current = Array.from({ length: 20 }, () => {
      const x = Math.random() * window.innerWidth
      const y = Math.random() * window.innerHeight
      return {
        x,
        y,
        targetX: x,
        targetY: y,
        baseX: x,
        baseY: y,
        size: Math.random() * 40 + 25, // Bigger size range: 25-65px
        opacity: Math.random() * 0.4 + 0.15, // More visible: 0.15-0.55
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 3, // Faster rotation
        speed: Math.random() * 0.5 + 0.2, // Individual speed
        wanderAngle: Math.random() * Math.PI * 2,
        wanderRadius: Math.random() * 80 + 40, // Random wander radius
        centerInfluence: Math.random() * 0.08 + 0.02, // Influence towards center
      }
    })

    return () => {
      window.removeEventListener("resize", updateDimensions)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      particlesRef.current.forEach((particle) => {
        if (!isPaused) {
          // Update wander angle for organic movement
          particle.wanderAngle += (Math.random() - 0.5) * 0.1

          // Calculate wander target around base position
          const wanderX = particle.baseX + Math.cos(particle.wanderAngle) * particle.wanderRadius
          const wanderY = particle.baseY + Math.sin(particle.wanderAngle) * particle.wanderRadius

          // Center influence - pull particles towards center of screen
          const centerInfluenceAmount = particle.centerInfluence
          particle.targetX = wanderX + (centerX - wanderX) * centerInfluenceAmount
          particle.targetY = wanderY + (centerY - wanderY) * centerInfluenceAmount

          // Add some random drift to base position
          particle.baseX += (Math.random() - 0.5) * 0.3
          particle.baseY += (Math.random() - 0.5) * 0.3

          // Keep base position within bounds with padding
          const padding = 100
          particle.baseX = Math.max(padding, Math.min(canvas.width - padding, particle.baseX))
          particle.baseY = Math.max(padding, Math.min(canvas.height - padding, particle.baseY))
        }

        // Smooth movement towards target with individual speed
        const easing = particle.speed * 0.03
        particle.x += (particle.targetX - particle.x) * easing
        particle.y += (particle.targetY - particle.y) * easing

        // Update rotation
        particle.rotation += particle.rotationSpeed

        // Draw hexagon
        ctx.save()
        ctx.translate(particle.x, particle.y)
        ctx.rotate((particle.rotation * Math.PI) / 180)
        ctx.globalAlpha = particle.opacity

        // Create hexagon path
        ctx.beginPath()
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3
          const x = Math.cos(angle) * particle.size
          const y = Math.sin(angle) * particle.size
          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.closePath()

        // Fill with red gradient (more vibrant)
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size)
        gradient.addColorStop(0, "rgba(239, 68, 68, 0.4)")
        gradient.addColorStop(0.7, "rgba(239, 68, 68, 0.2)")
        gradient.addColorStop(1, "rgba(239, 68, 68, 0.05)")
        ctx.fillStyle = gradient
        ctx.fill()

        // Stroke with varied intensity
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.6 * particle.opacity})`
        ctx.lineWidth = 1.5
        ctx.stroke()

        // Add inner glow
        ctx.beginPath()
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3
          const x = Math.cos(angle) * (particle.size * 0.7)
          const y = Math.sin(angle) * (particle.size * 0.7)
          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.closePath()
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.8 * particle.opacity})`
        ctx.lineWidth = 0.5
        ctx.stroke()

        ctx.restore()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPaused, dimensions])

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  )
}
