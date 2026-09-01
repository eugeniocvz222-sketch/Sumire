import { SubjectColor } from '../../types'

export interface ColorScheme {
  id: SubjectColor
  label: string
  bgGradient: string
  cardBg: string
  borderColor: string
  accentColor: string
  badgeBg: string
  badgeText: string
  dotColor: string
  spineGradient: string
}

export const COLOR_SCHEMES: Record<SubjectColor, ColorScheme> = {
  emerald: {
    id: 'emerald',
    label: 'Verde Esmeralda',
    bgGradient: 'from-emerald-900/40 via-emerald-950/20 to-slate-900',
    cardBg: 'bg-emerald-950/40',
    borderColor: 'border-emerald-500/30 hover:border-emerald-400/60',
    accentColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-300',
    dotColor: 'bg-emerald-400',
    spineGradient: 'from-emerald-600 to-teal-800',
  },
  blue: {
    id: 'blue',
    label: 'Azul Zafiro',
    bgGradient: 'from-blue-900/40 via-blue-950/20 to-slate-900',
    cardBg: 'bg-blue-950/40',
    borderColor: 'border-blue-500/30 hover:border-blue-400/60',
    accentColor: 'text-blue-400',
    badgeBg: 'bg-blue-500/20',
    badgeText: 'text-blue-300',
    dotColor: 'bg-blue-400',
    spineGradient: 'from-blue-600 to-indigo-800',
  },
  violet: {
    id: 'violet',
    label: 'Púrpura Amatista',
    bgGradient: 'from-purple-900/40 via-purple-950/20 to-slate-900',
    cardBg: 'bg-purple-950/40',
    borderColor: 'border-purple-500/30 hover:border-purple-400/60',
    accentColor: 'text-purple-400',
    badgeBg: 'bg-purple-500/20',
    badgeText: 'text-purple-300',
    dotColor: 'bg-purple-400',
    spineGradient: 'from-purple-600 to-violet-800',
  },
  amber: {
    id: 'amber',
    label: 'Ámbar Dorado',
    bgGradient: 'from-amber-900/40 via-amber-950/20 to-slate-900',
    cardBg: 'bg-amber-950/40',
    borderColor: 'border-amber-500/30 hover:border-amber-400/60',
    accentColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/20',
    badgeText: 'text-amber-300',
    dotColor: 'bg-amber-400',
    spineGradient: 'from-amber-600 to-yellow-800',
  },
  rose: {
    id: 'rose',
    label: 'Rosa Rubí',
    bgGradient: 'from-rose-900/40 via-rose-950/20 to-slate-900',
    cardBg: 'bg-rose-950/40',
    borderColor: 'border-rose-500/30 hover:border-rose-400/60',
    accentColor: 'text-rose-400',
    badgeBg: 'bg-rose-500/20',
    badgeText: 'text-rose-300',
    dotColor: 'bg-rose-400',
    spineGradient: 'from-rose-600 to-pink-800',
  },
  cyan: {
    id: 'cyan',
    label: 'Cian Océano',
    bgGradient: 'from-cyan-900/40 via-cyan-950/20 to-slate-900',
    cardBg: 'bg-cyan-950/40',
    borderColor: 'border-cyan-500/30 hover:border-cyan-400/60',
    accentColor: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/20',
    badgeText: 'text-cyan-300',
    dotColor: 'bg-cyan-400',
    spineGradient: 'from-cyan-600 to-blue-800',
  },
  indigo: {
    id: 'indigo',
    label: 'Índigo Profundo',
    bgGradient: 'from-indigo-900/40 via-indigo-950/20 to-slate-900',
    cardBg: 'bg-indigo-950/40',
    borderColor: 'border-indigo-500/30 hover:border-indigo-400/60',
    accentColor: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/20',
    badgeText: 'text-indigo-300',
    dotColor: 'bg-indigo-400',
    spineGradient: 'from-indigo-600 to-sky-800',
  },
  orange: {
    id: 'orange',
    label: 'Naranja Fuego',
    bgGradient: 'from-orange-900/40 via-orange-950/20 to-slate-900',
    cardBg: 'bg-orange-950/40',
    borderColor: 'border-orange-500/30 hover:border-orange-400/60',
    accentColor: 'text-orange-400',
    badgeBg: 'bg-orange-500/20',
    badgeText: 'text-orange-300',
    dotColor: 'bg-orange-400',
    spineGradient: 'from-orange-600 to-amber-800',
  },
  fuchsia: {
    id: 'fuchsia',
    label: 'Fucsia Neón',
    bgGradient: 'from-fuchsia-900/40 via-fuchsia-950/20 to-slate-900',
    cardBg: 'bg-fuchsia-950/40',
    borderColor: 'border-fuchsia-500/30 hover:border-fuchsia-400/60',
    accentColor: 'text-fuchsia-400',
    badgeBg: 'bg-fuchsia-500/20',
    badgeText: 'text-fuchsia-300',
    dotColor: 'bg-fuchsia-400',
    spineGradient: 'from-fuchsia-600 to-purple-800',
  },
  slate: {
    id: 'slate',
    label: 'Gris Grafito',
    bgGradient: 'from-slate-800/40 via-slate-900/20 to-slate-950',
    cardBg: 'bg-slate-900/60',
    borderColor: 'border-slate-600/30 hover:border-slate-500/60',
    accentColor: 'text-slate-300',
    badgeBg: 'bg-slate-700/30',
    badgeText: 'text-slate-200',
    dotColor: 'bg-slate-400',
    spineGradient: 'from-slate-600 to-slate-800',
  },
}
