"use client"

import { useEffect, useRef } from "react"
import { useMousePosition } from "@/hooks/use-mouse-position"

export default function ForestBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mousePosition = useMousePosition()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    // Particle class
    class Particle {
      x: number
      y: number
      size: number
      baseSize: number
      speedX: number
      speedY: number
      color: string

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.baseSize = Math.random * canvas.width
        this.y = Math.random() * canvas.height
        this.baseSize = Math.random() * 2 + 0.5
        this.size = this.baseSize
        this.speedX = Math.random() * 0.3 - 0.15
        this.speedY = Math.random() * 0.3 - 0.15
        this.color = this.getRandomColor()
      }

      getRandomColor() {
        const colors = [
          "rgba(34, 197, 94, 0.4)", // Green-500
          "rgba(16, 185, 129, 0.4)", // Emerald-500
          "rgba(5, 150, 105, 0.4)", // Green-600
          "rgba(20, 184, 166, 0.4)", // Teal-500
        ]
        return colors[Math.floor(Math.random() * colors.length)]
      }

      update(mouseX: number, mouseY: number) {
        this.x += this.speedX
        this.y += this.speedY

        // Boundary check
        if (this.x > canvas.width) this.x = 0
        else if (this.x < 0) this.x = canvas.width

        if (this.y > canvas.height) this.y = 0
        else if (this.y < 0) this.y = canvas.height

        // React to mouse position
        const dx = mouseX - this.x
        const dy = mouseY - this.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const maxDistance = 150

        if (distance < maxDistance) {
          // Increase size when mouse is near
          const scale = 1 + (maxDistance - distance) / maxDistance
          this.size = this.baseSize * scale

          // Move away from mouse slightly
          const angle = Math.atan2(dy, dx)
          const repelForce = ((maxDistance - distance) / maxDistance) * 0.5
          this.x -= Math.cos(angle) * repelForce
          this.y -= Math.sin(angle) * repelForce
        } else {
          this.size = this.baseSize
        }
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = this.color
        ctx.fill()
      }
    }

    // Create particles
    const particlesArray: Particle[] = []
    const numberOfParticles = Math.min(150, Math.floor((window.innerWidth * window.innerHeight) / 10000))

    for (let i = 0; i < numberOfParticles; i++) {
      particlesArray.push(new Particle())
    }

    // Animation function
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw and update particles
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update(mousePosition.x, mousePosition.y)
        particlesArray[i].draw()
      }

      // Draw connections
      connectParticles()

      requestAnimationFrame(animate)
    }

    // Connect particles with lines
    const connectParticles = () => {
      const maxDistance = 120

      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const dx = particlesArray[a].x - particlesArray[b].x
          const dy = particlesArray[a].y - particlesArray[b].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < maxDistance) {
            const opacity = 1 - distance / maxDistance
            ctx.strokeStyle = `rgba(34, 197, 94, ${opacity * 0.3})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y)
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y)
            ctx.stroke()
          }
        }
      }
    }

    // Start animation
    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [mousePosition])

  return <canvas ref={canvasRef} className="absolute inset-0 z-0" style={{ background: "transparent" }} />
}

