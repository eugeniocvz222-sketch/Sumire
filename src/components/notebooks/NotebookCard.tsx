import React, { useState } from 'react'
import { Subject } from '../../types'
import { IconRenderer } from '../common/IconRenderer'
import { COLOR_SCHEMES } from '../common/ColorMap'
import { FileText, CheckCircle2, MoreVertical, Edit2, Trash2, MapPin, Clock, BookOpen, Sparkles } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { alerts } from '../../lib/alerts'
import { BookPattern } from '../reactbits/Book3D'

interface NotebookCardProps {
  subject: Subject
  onOpen: () => void
  onEdit: () => void
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

const NotebookCardComponent: React.FC<NotebookCardProps> = ({ subject, onOpen, onEdit }) => {
  const { notes, tasks, deleteSubject } = useApp()
  const [showMenu, setShowMenu] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const subjectNotes = notes.filter((n) => n.subjectId === subject.id)
  const pendingTasks = tasks.filter((t) => t.subjectId === subject.id && !t.isCompleted)

  const scheme = COLOR_SCHEMES[subject.color] || COLOR_SCHEMES.violet
  const pattern = (subject.pattern as BookPattern) || 'minimal'
  const bookDepth = 30

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const confirmed = await alerts.confirm({
      title: `¿Eliminar "${subject.name}"?`,
      text: 'Se borrarán todos los apuntes, tareas y datos asociados a esta libreta.',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      isDanger: true,
      icon: 'warning',
    })

    if (confirmed) {
      deleteSubject(subject.id)
      alerts.success('Libreta eliminada', `Se eliminó "${subject.name}"`)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMenu(false)
    onEdit()
  }

  return (
    <div
      className="relative flex items-center justify-center p-3 select-none h-88 sm:h-92"
      style={{
        perspective: '1200px',
        perspectiveOrigin: '50% 50%',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setShowMenu(false)
      }}
      onClick={onOpen}
    >
      {/* 3D BOOK MAIN TRANSFORM SHELF CONTAINER */}
      <div
        className="relative w-full h-full transition-transform duration-500 ease-out cursor-pointer group"
        style={{
          transformStyle: 'preserve-3d',
          transform: isHovered
            ? 'rotateX(8deg) rotateY(-18deg) translateZ(24px) scale(1.03)'
            : 'rotateX(4deg) rotateY(-8deg) translateZ(0px)',
        }}
      >
        {/* 0. SOLID INNER CORE (Prevents see-through ghosting) */}
        <div
          className="absolute inset-0.5 bg-[#090912] rounded-r-lg"
          style={{ transform: 'translateZ(0px)' }}
        />

        {/* 1. FRONT COVER */}
        <div
          className={`absolute inset-0 rounded-r-2xl rounded-l-xs overflow-hidden flex flex-col justify-between p-5 border shadow-2xl bg-[#0c0c16] ${scheme.cardBg} ${scheme.borderColor}`}
          style={{
            transform: `translateZ(${bookDepth / 2}px)`,
            backgroundImage: PATTERN_STYLES[pattern],
            backgroundSize: PATTERN_BACKGROUND_SIZES[pattern],
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* Subtle Crease Effect near the spine */}
          <div className="absolute left-0 top-0 bottom-0 w-3.5 bg-gradient-to-r from-black/40 via-transparent to-white/5 pointer-events-none" />

          {/* Gloss Sheen Reflection */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />

          {/* Top Header: Code badge, semester and 3-dots Menu */}
          <div className="relative z-10 flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase shadow-xs ${scheme.badgeBg} ${scheme.badgeText}`}
              >
                {subject.code || 'MAT-101'}
              </span>
              <span className="text-[10px] font-semibold text-slate-300/80 bg-black/40 px-2 py-0.5 rounded-full backdrop-blur-xs">
                {subject.semester}
              </span>
            </div>

            {/* Menu Button */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(!showMenu)
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition opacity-80 group-hover:opacity-100 cursor-pointer"
                title="Opciones"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-7 z-30 w-36 bg-[#0c0c16] border border-white/10 rounded-xl shadow-2xl py-1 text-xs backdrop-blur-md animate-in fade-in zoom-in-95"
                >
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="w-full px-3 py-2 text-left text-slate-200 hover:text-white hover:bg-purple-600/20 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-purple-400" /> Editar
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="w-full px-3 py-2 text-left text-rose-400 hover:bg-rose-500/20 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Center: Book Icon & Title */}
          <div className="relative z-10 flex flex-col items-center text-center my-auto py-2">
            <div
              className={`w-13 h-13 rounded-2xl flex items-center justify-center border shadow-lg mb-2.5 transition-transform group-hover:scale-110 ${scheme.borderColor} ${scheme.accentColor} bg-black/40 backdrop-blur-xs`}
            >
              <IconRenderer icon={subject.icon} size={26} />
            </div>

            <h3 className="text-base font-extrabold text-white tracking-tight line-clamp-2 leading-tight drop-shadow-md group-hover:text-purple-200 transition-colors">
              {subject.name}
            </h3>

            {subject.professor && (
              <p className="text-[11px] text-slate-300/80 truncate mt-1 max-w-[170px]">
                {subject.professor}
              </p>
            )}

            {/* Embossed divider line */}
            <div className="w-10 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent my-2" />
          </div>

          {/* Bottom: Note and Task Counters */}
          <div className="relative z-10 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
            <div className="flex items-center gap-1 font-medium">
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>{subjectNotes.length} {subjectNotes.length === 1 ? 'apunte' : 'apuntes'}</span>
            </div>

            {pendingTasks.length > 0 ? (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3" />
                <span>{pendingTasks.length} {pendingTasks.length === 1 ? 'tarea' : 'tareas'}</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                <span>Al día</span>
              </span>
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
            {subject.code || subject.name || 'SUMIRE'}
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
          <div className="w-full h-full bg-gradient-to-r from-black/20 via-transparent to-black/15 pointer-events-none" />
        </div>

        {/* 4. TOP PAPER STACK */}
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

        {/* 5. BOTTOM PAPER STACK */}
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
          className={`absolute inset-0 rounded-l-2xl rounded-r-xs border shadow-2xl bg-[#0c0c16] ${scheme.cardBg} ${scheme.borderColor}`}
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
          className="absolute -bottom-4 right-7 w-3.5 h-7 bg-gradient-to-b from-purple-600 to-indigo-700 shadow-md pointer-events-none"
          style={{
            transform: `translateZ(${bookDepth / 2 - 4}px)`,
            clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 75%, 0 100%)',
          }}
        />

        {/* 8. 3D FLOOR DROP SHADOW */}
        <div
          className="absolute -bottom-5 left-3 right-3 h-5 bg-black/60 blur-md rounded-full pointer-events-none transition-opacity duration-300"
          style={{
            transform: `translateZ(-${bookDepth}px) rotateX(90deg)`,
            opacity: isHovered ? 0.8 : 0.45,
          }}
        />
      </div>
    </div>
  )
}

export const NotebookCard = React.memo(NotebookCardComponent)
