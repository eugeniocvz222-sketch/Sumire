import React from 'react'
import { useApp } from '../../context/AppContext'
import { SYSTEM_THEMES } from '../common/ThemeConfig'

interface MinimalBackgroundProps {
  className?: string
}

export const MinimalBackground: React.FC<MinimalBackgroundProps> = ({
  className = '',
}) => {
  let activeTheme = SYSTEM_THEMES.purple

  try {
    const { systemTheme } = useApp()
    if (systemTheme && SYSTEM_THEMES[systemTheme]) {
      activeTheme = SYSTEM_THEMES[systemTheme]
    }
  } catch {
    // If rendered outside AppProvider
    activeTheme = SYSTEM_THEMES.purple
  }

  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden select-none -z-10 ${className}`}>
      {/* Pure Matte Black Base */}
      <div className="absolute inset-0 bg-[#030306]/40 -z-10" />

      {/* Main Atmospheric Diffusion from the Bottom */}
      <div
        className="absolute -bottom-48 left-1/2 -translate-x-1/2 w-[1400px] h-[650px] opacity-45 blur-[150px] rounded-full pointer-events-none transition-all duration-700"
        style={{
          background: activeTheme.glowGradient,
        }}
      />

      {/* Secondary Soft Accent Diffusions */}
      <div
        className="absolute -bottom-32 left-1/3 w-[700px] h-[400px] opacity-30 blur-[120px] rounded-full pointer-events-none transition-all duration-700"
        style={{
          background: activeTheme.glowLeft,
        }}
      />
      <div
        className="absolute -bottom-32 right-1/3 w-[700px] h-[400px] opacity-30 blur-[120px] rounded-full pointer-events-none transition-all duration-700"
        style={{
          background: activeTheme.glowRight,
        }}
      />

      {/* Smooth Dark Gradient Layer for crisp contrast */}
      <div className="absolute inset-0 bg-linear-to-b from-[#030306]/70 via-transparent to-transparent pointer-events-none" />
    </div>
  )
}
