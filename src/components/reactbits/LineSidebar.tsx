import React, { useState } from 'react'
import { motion } from 'framer-motion'

export interface LineSidebarItem {
  id: string
  label: string
  icon: React.ReactNode
  badge?: string | number | React.ReactNode
  isActive?: boolean
  onClick?: () => void
  color?: string
}

interface LineSidebarGroupProps {
  items: LineSidebarItem[]
  activeId?: string
  onSelect?: (id: string) => void
  className?: string
  indicatorColor?: string
  groupId?: string
  isCollapsed?: boolean
}

export const LineSidebarGroup: React.FC<LineSidebarGroupProps> = ({
  items,
  activeId,
  onSelect,
  className = '',
  indicatorColor = 'var(--theme-primary, #9333ea)',
  groupId = 'default',
  isCollapsed = false,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className={`relative flex flex-col space-y-1.5 ${className}`}>
      {items.map((item) => {
        const isSelected = activeId === item.id || item.isActive
        const isHovered = hoveredId === item.id

        return (
          <button
            key={item.id}
            onClick={() => {
              item.onClick?.()
              onSelect?.(item.id)
            }}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
            title={isCollapsed ? item.label : undefined}
            className={`group relative w-full rounded-xl transition-all duration-200 flex items-center text-xs font-semibold cursor-pointer z-10 ${
              isCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5 text-left'
            } ${
              isSelected
                ? 'text-white font-bold bg-[#0d0d1a] shadow-md border border-[var(--theme-border,rgba(147,51,234,0.3))]'
                : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            {/* Active Sliding Glowing Line Indicator */}
            {isSelected && (
              <motion.div
                layoutId={`line-sidebar-active-${groupId}`}
                className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full shadow-lg"
                style={{
                  backgroundColor: indicatorColor,
                  boxShadow: `0 0 14px var(--theme-glow, rgba(147, 51, 234, 0.6))`,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 30,
                }}
              />
            )}

            {/* Hover subtle line indicator */}
            {isHovered && !isSelected && (
              <motion.div
                layoutId={`line-sidebar-hover-${groupId}`}
                className="absolute left-0 top-2.5 bottom-2.5 w-0.5 bg-[var(--theme-accent,#c084fc)] opacity-50 rounded-r-full"
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 30,
                }}
              />
            )}

            {/* Item Content */}
            <div className={`flex items-center min-w-0 ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
              <div
                className={`transition-transform duration-200 group-hover:scale-110 shrink-0 ${
                  isSelected ? 'text-[var(--theme-accent,#c084fc)]' : 'text-slate-400 group-hover:text-white'
                }`}
              >
                {item.icon}
              </div>
              {!isCollapsed && (
                <span className={`truncate font-medium ${isSelected ? 'text-white font-semibold' : 'text-slate-300 group-hover:text-white'}`}>
                  {item.label}
                </span>
              )}
            </div>

            {/* Badge Counter */}
            {!isCollapsed && item.badge !== undefined && (
              <div className="shrink-0 ml-2">
                {typeof item.badge === 'string' || typeof item.badge === 'number' ? (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono transition ${
                      isSelected
                        ? 'bg-[var(--theme-badge-bg,rgba(147,51,234,0.15))] text-[var(--theme-badge-text,#c084fc)] border border-[var(--theme-border,rgba(147,51,234,0.3))]'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : (
                  item.badge
                )}
              </div>
            )}

            {/* Floating Badge Indicator for Collapsed Mode */}
            {isCollapsed && item.badge !== undefined && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[var(--theme-primary,#9333ea)] shadow-xs" />
            )}
          </button>
        )
      })}
    </div>
  )
}
