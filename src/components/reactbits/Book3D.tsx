import React, { useState } from 'react'
import { IconRenderer } from '../common/IconRenderer'
import { SubjectColor, SubjectIcon } from '../../types'
import { COLOR_SCHEMES } from '../common/ColorMap'
import { BookOpen, Sparkles, User, MapPin } from 'lucide-react'

export type BookPattern = 'minimal' | 'grid' | 'dots' | 'blueprint' | 'wave' | 'hologram'

interface Book3DProps {
  title: string
  code: string
  color: SubjectColor
  icon: SubjectIcon | string
  semester?: string
  professor?: string
  classroom?: string
  pattern?: BookPattern
  depth?: number // in px (e.g. 30)
  size?: 'sm' | 'md' | 'lg' | 'preview'
  rotateY?: number
  rotateX?: number
  isHoverable?: boolean
  className?: string
  onClick?: () => void
}

const PATTERN_STYLES: Record<BookPattern, string> = {
  minimal: 'radial-gradient(circle at 100% 0%, rgba(255,255,255,0.08) 0%, transparent 70%)',
  grid: 'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
  dots: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
  blueprint: 'linear-gradient(rgba(255,255,255,0.08) 2px, transparent 2px), linear-gradient(90deg, rgba(255,255,255,0.08) 2px, transparent 2px)',
  wave: 'radial-gradient(circle at 50% 120%, rgba(255,255,255,0.15), transparent 70%)',
  hologram: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 40%, rgba(255,255,255,0.15) 60%, transparent 100%)',
}

const PATTERN_BACKGROUND_SIZES: Record<BookPattern, string> = {
  minimal: 'auto',
  grid: '20px 20px',
  dots: '16px 16px',
  blueprint: '32px 32px',
  wave: 'auto',
  hologram: 'auto',
}

export const Book3D: React.FC<Book3DProps> = ({
  title,
  code,
  color,
  icon,
  semester = '7mo Cuatrimestre',
  professor,
  classroom,
  pattern = 'minimal',
  depth = 34,
  size = 'md',
  rotateY: customRotateY,
  rotateX: customRotateX,
  isHoverable = true,
  className = '',
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const scheme = COLOR_SCHEMES[color] || COLOR_SCHEMES.emerald

  // Sizing matrix
  const dimensions = {
    sm: { width: 170, height: 230, depth: 26 },
    md: { width: 220, height: 300, depth: 32 },
    lg: { width: 260, height: 350, depth: 38 },
    preview: { width: 240, height: 320, depth: 36 },
  }[size]

  const bookDepth = depth || dimensions.depth

  // Dynamic Rotation angles
  let rotY = customRotateY !== undefined ? customRotateY : isHovered && isHoverable ? -22 : -12
  let rotX = customRotateX !== undefined ? customRotateX : isHovered && isHoverable ? 8 : 4

  return (
    <div
      className={`relative select-none flex items-center justify-center p-4 ${className}`}
      style={{
        perspective: '1200px',
        perspectiveOrigin: '50% 50%',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* 3D BOOK MAIN TRANSFORM CONTAINER */}
      <div
        className="relative transition-transform duration-500 ease-out cursor-pointer"
        style={{
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) ${isHovered && isHoverable ? 'translateZ(20px) scale(1.03)' : 'translateZ(0px)'}`,
        }}
      >
        {/* 0. SOLID INNER CORE (Prevents any see-through ghosting) */}
        <div
          className="absolute inset-0.5 bg-[#090912] rounded-r-lg"
          style={{ transform: 'translateZ(0px)' }}
        />

        {/* 1. FRONT COVER */}
        <div
          className={`absolute inset-0 rounded-r-xl rounded-l-xs overflow-hidden flex flex-col justify-between p-5 border shadow-2xl bg-[#0c0c16] ${scheme.cardBg} ${scheme.borderColor}`}
          style={{
            transform: `translateZ(${bookDepth / 2}px)`,
            backgroundImage: PATTERN_STYLES[pattern],
            backgroundSize: PATTERN_BACKGROUND_SIZES[pattern],
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* Subtle Crease Effect near the spine */}
          <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/40 via-transparent to-white/5 pointer-events-none" />

          {/* Gloss Sheen Reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />

          {/* Top Header: Code badge and semester */}
          <div className="relative z-10 flex items-start justify-between gap-2">
            <span
              className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase shadow-xs ${scheme.badgeBg} ${scheme.badgeText}`}
            >
              {code || 'MAT-101'}
            </span>
            <span className="text-[10px] font-semibold text-slate-300/80 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
              {semester}
            </span>
          </div>

          {/* Center: Book Icon & Title */}
          <div className="relative z-10 flex flex-col items-center text-center my-auto py-2">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg mb-3.5 transition-transform ${scheme.borderColor} ${scheme.accentColor} bg-black/40 backdrop-blur-xs`}
            >
              <IconRenderer icon={icon} size={28} />
            </div>

            <h3 className="text-base sm:text-lg font-black text-white tracking-tight line-clamp-2 leading-tight drop-shadow-md">
              {title || 'Nueva Libreta'}
            </h3>

            {/* Embossed divider line */}
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent my-2" />
          </div>

          {/* Bottom: Professor & Classroom Details */}
          <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5 truncate max-w-[130px]">
              <User className="w-3 h-3 text-slate-400 shrink-0" />
              <span className="truncate">{professor || 'Sin profesor'}</span>
            </div>
            {classroom && (
              <div className="flex items-center gap-1 shrink-0 text-slate-400">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{classroom}</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. BOOK SPINE (LOMO IZQUIERDO 3D) */}
        <div
          className={`absolute top-0 bottom-0 rounded-l-xs flex flex-col items-center justify-between py-5 px-1 border-y border-l shadow-inner ${scheme.cardBg} ${scheme.borderColor}`}
          style={{
            width: `${bookDepth}px`,
            left: `-${bookDepth / 2}px`,
            transform: 'rotateY(-90deg)',
            backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(0,0,0,0.3)), ${PATTERN_STYLES[pattern]}`,
          }}
        >
          <div className="w-2.5 h-1 rounded-full bg-white/40 mb-1" />

          {/* Vertical Book Code/Title */}
          <div
            className="text-[10px] font-mono font-bold tracking-widest text-white/90 uppercase whitespace-nowrap"
            style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
            }}
          >
            {code || title || 'SUMIRE'}
          </div>

          <div className="w-2.5 h-1 rounded-full bg-white/40 mt-1" />
        </div>

        {/* 3. RIGHT PAPER STACK (PÁGINAS DERECHAS 3D CON GROSOR) */}
        <div
          className="absolute top-1 bottom-1 bg-[#eae6df] shadow-inner rounded-r-xs flex flex-col justify-between overflow-hidden"
          style={{
            width: `${bookDepth - 4}px`,
            right: `-${bookDepth / 2 - 2}px`,
            transform: 'rotateY(90deg)',
            backgroundImage:
              'repeating-linear-gradient(to bottom, #d8d4cb 0px, #f5f2eb 2px, #c8c4bc 3px, #ffffff 4px)',
          }}
        >
          {/* Paper page shadow effect */}
          <div className="w-full h-full bg-gradient-to-r from-black/20 via-transparent to-black/15 pointer-events-none" />
        </div>

        {/* 4. TOP PAPER STACK (PÁGINAS SUPERIORES) */}
        <div
          className="absolute left-2 right-1 bg-[#eae6df] shadow-inner overflow-hidden"
          style={{
            height: `${bookDepth - 4}px`,
            top: `-${bookDepth / 2 - 2}px`,
            transform: 'rotateX(90deg)',
            backgroundImage:
              'repeating-linear-gradient(to right, #d8d4cb 0px, #f5f2eb 2px, #c8c4bc 3px, #ffffff 4px)',
          }}
        />

        {/* 5. BOTTOM PAPER STACK (PÁGINAS INFERIORES) */}
        <div
          className="absolute left-2 right-1 bg-[#eae6df] shadow-inner overflow-hidden"
          style={{
            height: `${bookDepth - 4}px`,
            bottom: `-${bookDepth / 2 - 2}px`,
            transform: 'rotateX(-90deg)',
            backgroundImage:
              'repeating-linear-gradient(to right, #d8d4cb 0px, #f5f2eb 2px, #c8c4bc 3px, #ffffff 4px)',
          }}
        />

        {/* 6. BACK COVER (CONTRAPORTADA 3D) */}
        <div
          className={`absolute inset-0 rounded-l-xl rounded-r-xs border shadow-2xl bg-[#0c0c16] ${scheme.cardBg} ${scheme.borderColor}`}
          style={{
            transform: `translateZ(-${bookDepth / 2}px) rotateY(180deg)`,
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            backgroundImage: PATTERN_STYLES[pattern],
            backgroundSize: PATTERN_BACKGROUND_SIZES[pattern],
          }}
        >
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center opacity-40">
            <BookOpen className="w-8 h-8 text-white mb-2" />
            <span className="text-[10px] font-mono text-white tracking-widest uppercase">
              SUMIRE NOTEBOOK
            </span>
          </div>
        </div>

        {/* 7. BOOKMARK RIBBON (LISTÓN MARCADOR COLGANTE) */}
        <div
          className="absolute -bottom-5 right-8 w-4 h-8 bg-gradient-to-b from-purple-600 to-indigo-700 shadow-md pointer-events-none"
          style={{
            transform: `translateZ(${bookDepth / 2 - 6}px)`,
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 75%, 0 100%)',
          }}
        />

        {/* 8. 3D FLOOR DROP SHADOW */}
        <div
          className="absolute -bottom-6 left-2 right-2 h-6 bg-black/60 blur-md rounded-full pointer-events-none transition-opacity duration-300"
          style={{
            transform: `translateZ(-${bookDepth}px) rotateX(90deg)`,
            opacity: isHovered && isHoverable ? 0.8 : 0.5,
          }}
        />
      </div>
    </div>
  )
}
