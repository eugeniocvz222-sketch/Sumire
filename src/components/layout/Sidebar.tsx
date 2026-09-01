import React, { useState } from 'react'
import {
  BookOpen,
  CheckCircle2,
  Plus,
  GraduationCap,
  ChevronDown,
  Clock,
  User,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { ShinyText } from '../reactbits/ShinyText'
import { LineSidebarGroup, LineSidebarItem } from '../reactbits/LineSidebar'

interface SidebarProps {
  onOpenNewSubject: () => void
  onOpenSettings: () => void
  onOpenNewPeriod: () => void
  onOpenOnboarding?: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenNewPeriod,
  onOpenOnboarding,
  isCollapsed,
  onToggleCollapse,
}) => {
  const {
    user,
    periods,
    activePeriodId,
    activePeriod,
    setActivePeriodId,
    setSelectedSemester,
    filteredSubjects,
    tasks,
    activeView,
    setActiveView,
    setActiveSubjectId,
    logout,
  } = useApp()

  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)

  const pendingTasksCount = tasks.filter((t) => {
    const isSubjectInPeriod = filteredSubjects.some((s) => s.id === t.subjectId)
    return isSubjectInPeriod && !t.isCompleted
  }).length

  const handleSelectPeriod = (period: typeof periods[0]) => {
    setActivePeriodId(period.id)
    setSelectedSemester(period.name)
    setActiveSubjectId(null)
    setActiveView('shelf')
    setShowPeriodDropdown(false)
  }

  const handleLogout = (e: React.MouseEvent) => {
    e.stopPropagation()
    logout()
  }

  const mainNavItems: LineSidebarItem[] = [
    {
      id: 'shelf',
      label: 'Mis Libretas',
      icon: <BookOpen className="w-4 h-4" />,
      badge: filteredSubjects.length > 0 ? filteredSubjects.length : undefined,
      onClick: () => {
        setActiveSubjectId(null)
        setActiveView('shelf')
      },
    },
    {
      id: 'tasks',
      label: 'Tareas & Entregables',
      icon: <CheckCircle2 className="w-4 h-4" />,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
      onClick: () => setActiveView('tasks'),
    },
    {
      id: 'schedule',
      label: 'Horario Semanal',
      icon: <Clock className="w-4 h-4" />,
      onClick: () => setActiveView('schedule'),
    },
  ]

  return (
    <aside
      className={`bg-[#05050a] border-r border-slate-800/80 flex flex-col h-full shrink-0 select-none z-20 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header with Toggle Button */}
      <div className={`border-b border-slate-800/80 flex items-center ${isCollapsed ? 'p-3 justify-center' : 'p-4 justify-between'}`}>
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-[var(--theme-glow,rgba(147,51,234,0.4))] ring-2 ring-[var(--theme-border,rgba(147,51,234,0.5))] shrink-0 group bg-[#05050a]">
                <img src="/apuntes_mascot.png" alt="Apuntes AI Mascot" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  <ShinyText text="Sumire" speed={4} />
                </h1>
                <p className="text-[10px] text-[var(--theme-accent,#c084fc)] font-medium">Gestor Universitario IA</p>
              </div>
            </div>

            {/* Sidebar Collapse Toggle Button (21st.dev Style) */}
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Ocultar Barra Lateral (Ctrl+B)"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-[var(--theme-glow,rgba(147,51,234,0.4))] ring-2 ring-[var(--theme-border,rgba(147,51,234,0.5))] hover:scale-105 transition-all cursor-pointer group bg-[#05050a]"
            title="Expandir Barra Lateral (Ctrl+B)"
          >
            <img src="/apuntes_mascot.png" alt="Apuntes AI Mascot" className="w-full h-full object-cover group-hover:opacity-60 transition-opacity" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <PanelLeftOpen className="w-4 h-4 text-white" />
            </div>
          </button>
        )}
      </div>

      {/* Cuatrimestre Selector Card */}
      <div className="p-3 border-b border-slate-800/80 relative">
        {!isCollapsed ? (
          <button
            onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800 hover:border-[var(--theme-border-hover,rgba(147,51,234,0.6))] text-left transition flex items-center justify-between group cursor-pointer"
          >
            <div className="min-w-0 pr-2">
              <div className="text-[10px] font-semibold text-[var(--theme-accent,#c084fc)] uppercase tracking-wider">
                Periodo Académico
              </div>
              <div className="text-xs font-bold text-white truncate group-hover:text-[var(--theme-badge-text,#c084fc)]">
                {activePeriod ? activePeriod.name : 'Seleccionar'}
              </div>
            </div>
            <ChevronDown
              className={`w-4 h-4 text-slate-400 group-hover:text-white transition-transform duration-200 shrink-0 ${
                showPeriodDropdown ? 'rotate-180' : ''
              }`}
            />
          </button>
        ) : (
          <button
            onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
            className="w-full p-2.5 rounded-xl bg-slate-900/60 hover:bg-[var(--theme-badge-bg,rgba(147,51,234,0.15))] border border-slate-800 hover:border-[var(--theme-border,rgba(147,51,234,0.4))] text-[var(--theme-accent,#c084fc)] flex items-center justify-center transition cursor-pointer"
            title={`Periodo: ${activePeriod?.name || 'Seleccionar'}`}
          >
            <GraduationCap className="w-4 h-4" />
          </button>
        )}

        {/* Dropdown Menu */}
        {showPeriodDropdown && (
          <div className="absolute left-3 right-3 sm:w-60 top-16 z-30 bg-[#090910] border border-slate-800 rounded-2xl shadow-2xl p-1.5 space-y-1 backdrop-blur-xl">
            <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Tus Cuatrimestres / Semestres
            </div>
            {periods.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPeriod(p)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                  p.id === activePeriodId
                    ? 'bg-[var(--theme-badge-bg,rgba(147,51,234,0.2))] text-[var(--theme-badge-text,#c084fc)] font-bold border border-[var(--theme-border,rgba(147,51,234,0.3))]'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="truncate">
                  <div className="truncate text-white font-medium">{p.name}</div>
                  <div className="text-[10px] text-slate-400">{p.dateRange}</div>
                </div>
                {p.isCurrent && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    Actual
                  </span>
                )}
              </button>
            ))}

            <div className="pt-1 border-t border-slate-800">
              <button
                onClick={() => {
                  setShowPeriodDropdown(false)
                  onOpenNewPeriod()
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg text-[var(--theme-badge-text,#c084fc)] hover:bg-[var(--theme-badge-bg,rgba(147,51,234,0.15))] hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Agregar Cuatrimestre / Semestre
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Period Modules with LineSidebar */}
      <div className="p-3 flex-1 overflow-y-auto">
        <LineSidebarGroup
          items={mainNavItems}
          activeId={activeView}
          indicatorColor="var(--theme-primary, #9333ea)"
          groupId="main-nav"
          isCollapsed={isCollapsed}
        />
      </div>

      {/* User Profile Section at Bottom */}
      <div className="p-3 border-t border-slate-800/80 bg-black/40">
        {!isCollapsed ? (
          <div
            onClick={() => setActiveView('profile')}
            className={`w-full p-2.5 rounded-2xl text-left transition-all duration-200 flex items-center justify-between group cursor-pointer ${
              activeView === 'profile'
                ? 'bg-purple-950/50 ring-1 ring-[var(--theme-border,rgba(147,51,234,0.6))] shadow-lg shadow-purple-950/40'
                : 'hover:bg-slate-900/80 border border-transparent hover:border-slate-800'
            }`}
            title="Abrir Mi Perfil Universitario"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative shrink-0">
                <div className={`w-9 h-9 rounded-xl bg-purple-950/80 border overflow-hidden shadow-xs flex items-center justify-center transition-all ${
                  activeView === 'profile'
                    ? 'border-purple-400 ring-2 ring-purple-500/40'
                    : 'border-[var(--theme-border,rgba(147,51,234,0.4))] group-hover:border-purple-400'
                }`}>
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#030306]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className={`text-xs font-bold truncate transition-colors ${
                  activeView === 'profile' ? 'text-[var(--theme-badge-text,#c084fc)]' : 'text-white group-hover:text-[var(--theme-badge-text,#c084fc)]'
                }`}>
                  {user?.name || 'Estudiante'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {user?.career || 'Ing. Software'}
                </div>
              </div>
            </div>

            {/* Direct LogOut Icon Button (Does NOT trigger profile navigation) */}
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition shrink-0 ml-1 cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveView('profile')}
              className="relative group cursor-pointer"
              title={`Perfil: ${user?.name || 'Estudiante'}`}
            >
              <div className={`w-9 h-9 rounded-xl bg-purple-950/80 border overflow-hidden shadow-xs flex items-center justify-center transition-all ${
                activeView === 'profile'
                  ? 'border-purple-400 ring-2 ring-purple-500/50 scale-105'
                  : 'border-[var(--theme-border,rgba(147,51,234,0.4))] group-hover:border-purple-400 group-hover:scale-105'
              }`}>
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#030306]" />
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
