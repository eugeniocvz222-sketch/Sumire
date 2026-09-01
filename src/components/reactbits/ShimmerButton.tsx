import React, { useRef, useState } from 'react'

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  shimmerColor?: string
  shimmerSize?: string
  borderRadius?: string
  shimmerDuration?: string
  icon?: React.ReactNode
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      children,
      className = '',
      shimmerColor = 'rgba(255, 255, 255, 0.25)',
      shimmerSize = '0.1em',
      shimmerDuration = '2.5s',
      borderRadius = '14px',
      icon,
      disabled,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'px-3.5 py-1.5 text-xs gap-1.5',
      md: 'px-5 py-2.5 text-xs gap-2',
      lg: 'px-6 py-3 text-sm gap-2.5',
    }[size]

    const variantStyles = {
      primary:
        'bg-linear-to-r from-[var(--theme-grad-start,#9333ea)] via-[var(--theme-grad-end,#6366f1)] to-[var(--theme-grad-start,#9333ea)] bg-[length:200%_auto] text-white shadow-lg shadow-[var(--theme-glow,rgba(147,51,234,0.3))] hover:shadow-[var(--theme-glow,rgba(147,51,234,0.6))] hover:bg-[position:right_center]',
      secondary:
        'bg-[#121220] hover:bg-[#18182c] text-white shadow-md shadow-black/40 border border-white/10 hover:border-[var(--theme-border-hover,rgba(147,51,234,0.8))] hover:shadow-[var(--theme-glow-subtle,rgba(147,51,234,0.15))]',
      glass:
        'bg-black/60 hover:bg-black/80 text-white backdrop-blur-md border border-white/15 hover:border-[var(--theme-border-hover,rgba(147,51,234,0.8))] shadow-lg hover:shadow-[var(--theme-glow-subtle,rgba(147,51,234,0.2))]',
      danger:
        'bg-linear-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-600/30 hover:shadow-rose-500/50',
      ghost:
        'bg-transparent hover:bg-white/5 text-slate-300 hover:text-white',
    }[variant]

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`group relative inline-flex items-center justify-center font-bold tracking-wide transition-all duration-300 active:scale-[0.97] hover:scale-[1.02] cursor-pointer select-none overflow-hidden ${sizeClasses} ${variantStyles} ${
          disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
        } ${className}`}
        style={{
          borderRadius,
        }}
        {...props}
      >
        {/* Animated 21st.dev Shimmer Light Sweep */}
        {variant !== 'ghost' && (
          <div
            className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${shimmerColor} 50%, transparent 100%)`,
            }}
          />
        )}

        {/* Top subtle highlight line for physical depth */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-white/25 opacity-70 group-hover:opacity-100 transition-opacity" />

        {/* Content */}
        {icon && <span className="shrink-0 transition-transform duration-200 group-hover:scale-110">{icon}</span>}
        <span className="relative z-10">{children}</span>
      </button>
    )
  }
)

ShimmerButton.displayName = 'ShimmerButton'
