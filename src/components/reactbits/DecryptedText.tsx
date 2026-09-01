import React, { useEffect, useState, useRef } from 'react'

interface DecryptedTextProps {
  text: string
  speed?: number
  maxIterations?: number
  characters?: string
  className?: string
  parentClassName?: string
  encryptedClassName?: string
  animateOn?: 'hover' | 'view'
}

export const DecryptedText: React.FC<DecryptedTextProps> = ({
  text,
  speed = 40,
  maxIterations = 10,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890#$@%&*',
  className = '',
  parentClassName = '',
  encryptedClassName = 'text-indigo-400',
  animateOn = 'hover',
}) => {
  const [displayText, setDisplayText] = useState(text)
  const [isHovering, setIsHovering] = useState(false)
  const [isScrambling, setIsScrambling] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const scramble = () => {
    let iteration = 0
    setIsScrambling(true)

    if (intervalRef.current) clearInterval(intervalRef.current)

    intervalRef.current = setInterval(() => {
      setDisplayText((_) =>
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' '
            if (index < iteration / (maxIterations / text.length)) {
              return text[index]
            }
            return characters[Math.floor(Math.random() * characters.length)]
          })
          .join('')
      )

      iteration += 1

      if (iteration >= maxIterations) {
        if (intervalRef.current) clearInterval(intervalRef.current)
        setDisplayText(text)
        setIsScrambling(false)
      }
    }, speed)
  }

  useEffect(() => {
    setDisplayText(text)
  }, [text])

  return (
    <span
      className={`inline-block ${parentClassName}`}
      onMouseEnter={() => {
        setIsHovering(true)
        if (animateOn === 'hover' && !isScrambling) scramble()
      }}
      onMouseLeave={() => setIsHovering(false)}
    >
      <span className={`${isScrambling ? encryptedClassName : ''} ${className}`}>
        {displayText}
      </span>
    </span>
  )
}
