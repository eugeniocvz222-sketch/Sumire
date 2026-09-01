import React from 'react'
import {
  Search,
  Settings,
  GraduationCap,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'

interface HeaderProps {
  onOpenSettings: () => void
  onOpenSearch: () => void
  onOpenNewSubject: () => void
  onOpenNewPeriod: () => void
  onOpenOnboarding?: () => void
  isSidebarCollapsed?: boolean
  onToggleSidebar?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenSearch,
  onOpenOnboarding,
  isSidebarCollapsed,
  onToggleSidebar,
}) => {
  const { activePeriod } = useApp()

  return (
    <header className="h-14 border-b border-slate-800/80 bg-[#06060c]/80 backdrop-blur-md px-4 flex items-center justify-between gap-4 shrink-0 z-20">
      {/* Left: Sidebar Toggle Button + Quick Search Bar + Active Period Badge */}
      <div className="flex items-center gap-3">
        {onToggleSidebar && isSidebarCollapsed && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent hover:border-slate-800 rounded-xl transition cursor-pointer"
            title="Expandir Barra Lateral (Ctrl+B)"
          >
            <PanelLeftOpen className="w-4 h-4 text-[var(--theme-accent,#c084fc)]" />
          </button>
        )}

        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 px-3.5 py-1.5 bg-black/50 hover:bg-black/70 border border-slate-800 hover:border-[var(--theme-border-hover,rgba(147,51,234,0.6))] rounded-xl text-xs text-slate-400 hover:text-slate-200 transition w-56 md:w-80 shadow-xs cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-[var(--theme-accent,#c084fc)] shrink-0" />
          <span className="flex-1 text-left truncate">Buscar en Sumire (apuntes, tareas)...</span>
          <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800 rounded-md">
            Ctrl+K
          </kbd>
        </button>

        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-[var(--theme-badge-bg,rgba(147,51,234,0.15))] border border-[var(--theme-border,rgba(147,51,234,0.3))] rounded-xl text-xs text-[var(--theme-badge-text,#c084fc)] font-medium">
          <GraduationCap className="w-3.5 h-3.5 text-[var(--theme-accent,#c084fc)] shrink-0" />
          <span className="font-semibold">{activePeriod?.name || '7mo Cuatrimestre'}</span>
          <span className="opacity-50">•</span>
          <span className="text-[11px] opacity-80">{activePeriod?.dateRange || 'Sept - Dic 2026'}</span>
        </div>
      </div>

      {/* Right: Tutorial / Help + Settings Gear Icon Button */}
      <div className="flex items-center gap-2">
        {onOpenOnboarding && (
          <button
            type="button"
            onClick={onOpenOnboarding}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl transition cursor-pointer font-medium"
            title="Ver Guía de Inicio y Atajos"
          >
            <Sparkles className="w-3.5 h-3.5 text-[var(--theme-accent,#c084fc)]" />
            <span className="hidden sm:inline">Guía Sumire</span>
          </button>
        )}

        <button
          onClick={onOpenSettings}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent hover:border-slate-800 rounded-xl transition cursor-pointer"
          title="Configuración"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
