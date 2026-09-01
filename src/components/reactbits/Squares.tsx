import React, { useRef, useEffect } from 'react'

interface SquaresProps {
  direction?: 'diagonal' | 'up' | 'right' | 'down' | 'left'
  speed?: number
  borderColor?: string
  squareSize?: number
  hoverFillColor?: string
  className?: string
}

export const Squares: React.FC<SquaresProps> = ({
  direction = 'diagonal',
  speed = 0.5,
  borderColor = '#1e293b',
  squareSize = 40,
  hoverFillColor = 'rgba(99, 102, 241, 0.1)',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gridOffset = useRef({ x: 0, y: 0 })
  const hoveredSquare = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    const handleResize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth
        canvas.height = canvas.parentElement.clientHeight
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize
      const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize

      for (let x = startX; x < canvas.width + squareSize; x += squareSize) {
        for (let y = startY; y < canvas.height + squareSize; y += squareSize) {
          const squareX = x - (gridOffset.current.x % squareSize)
          const squareY = y - (gridOffset.current.y % squareSize)

          if (
            hoveredSquare.current &&
            Math.floor((x - (gridOffset.current.x % squareSize)) / squareSize) ===
              hoveredSquare.current.x &&
            Math.floor((y - (gridOffset.current.y % squareSize)) / squareSize) ===
              hoveredSquare.current.y
          ) {
            ctx.fillStyle = hoverFillColor
            ctx.fillRect(squareX, squareY, squareSize, squareSize)
          }

          ctx.strokeStyle = borderColor
          ctx.lineWidth = 0.5
          ctx.strokeRect(squareX, squareY, squareSize, squareSize)
        }
      }

      switch (direction) {
        case 'right':
          gridOffset.current.x -= speed
          break
        case 'left':
          gridOffset.current.x += speed
          break
        case 'down':
          gridOffset.current.y -= speed
          break
        case 'up':
          gridOffset.current.y += speed
          break
        case 'diagonal':
        default:
          gridOffset.current.x -= speed * 0.7
          gridOffset.current.y -= speed * 0.7
          break
      }

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      const col = Math.floor(mouseX / squareSize)
      const row = Math.floor(mouseY / squareSize)

      hoveredSquare.current = { x: col, y: row }
    }

    const handleMouseLeave = () => {
      hoveredSquare.current = null
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [direction, speed, borderColor, squareSize, hoverFillColor])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-auto opacity-30 ${className}`}
    />
  )
}
