import React from 'react'

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  icon?: React.ReactNode
  glowColor?: string
  borderRadius?: string
}

export const GlowButton = React.forwardRef<HTMLButtonElement, GlowButtonProps>(
  (
    {
      children,
      icon,
      className = '',
      glowColor = 'from-purple-500 via-indigo-500 to-purple-600',
      borderRadius = '14px',
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative group inline-block p-[1px] overflow-hidden select-none" style={{ borderRadius }}>
        {/* Rotating / Pulsing Glowing Border */}
        <div
          className={`absolute inset-0 bg-linear-to-r ${glowColor} opacity-70 group-hover:opacity-100 blur-xs transition duration-500 group-hover:duration-200 animate-tilt`}
        />

        {/* Button Core */}
        <button
          ref={ref}
          disabled={disabled}
          className={`relative flex items-center justify-center gap-2 px-5 py-2.5 bg-[#090912] hover:bg-[#0f0f1c] text-white text-xs font-bold transition-all duration-200 active:scale-[0.98] cursor-pointer ${
            disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
          } ${className}`}
          style={{ borderRadius: `calc(${borderRadius} - 1px)` }}
          {...props}
        >
          {icon && <span className="text-purple-400 group-hover:scale-110 transition-transform">{icon}</span>}
          <span className="relative z-10">{children}</span>
        </button>
      </div>
    )
  }
)

GlowButton.displayName = 'GlowButton'
