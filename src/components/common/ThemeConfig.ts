export type SystemTheme = 'purple' | 'red' | 'emerald' | 'blue' | 'amber' | 'cyberpunk'

export interface ThemeDefinition {
  id: SystemTheme
  name: string
  subtitle: string
  primaryHex: string
  secondaryHex: string
  accentHex: string
  rgb: string
  secondaryRgb: string
  gradientText: string
  glowGradient: string
  glowLeft: string
  glowRight: string
  badgeBg: string
  badgeText: string
  accentColor: string
  borderColor: string
  hoverBorder: string
  swatchGradient: string
}

export const SYSTEM_THEMES: Record<SystemTheme, ThemeDefinition> = {
  purple: {
    id: 'purple',
    name: 'Midnight Purple',
    subtitle: 'Negro mate con aurora violeta y púrpura',
    primaryHex: '#9333ea',
    secondaryHex: '#6366f1',
    accentHex: '#c084fc',
    rgb: '147, 51, 234',
    secondaryRgb: '99, 102, 241',
    gradientText: 'from-purple-400 to-indigo-400',
    glowGradient:
      'radial-gradient(ellipse at 50% 100%, rgba(139, 92, 246, 0.5) 0%, rgba(124, 58, 237, 0.3) 40%, rgba(88, 28, 135, 0.12) 70%, transparent 85%)',
    glowLeft: 'radial-gradient(circle, rgba(168, 85, 247, 0.35) 0%, transparent 70%)',
    glowRight: 'radial-gradient(circle, rgba(126, 34, 206, 0.35) 0%, transparent 70%)',
    badgeBg: 'bg-purple-500/15',
    badgeText: 'text-purple-300',
    accentColor: 'text-purple-400',
    borderColor: 'border-purple-500/30',
    hoverBorder: 'hover:border-purple-500',
    swatchGradient: 'from-purple-600 via-indigo-600 to-violet-500',
  },
  red: {
    id: 'red',
    name: 'Crimson Ruby',
    subtitle: 'Negro obsidiana con resplandor carmesí y rojo neón',
    primaryHex: '#e11d48',
    secondaryHex: '#f43f5e',
    accentHex: '#fb7185',
    rgb: '225, 29, 72',
    secondaryRgb: '244, 63, 94',
    gradientText: 'from-rose-400 to-red-400',
    glowGradient:
      'radial-gradient(ellipse at 50% 100%, rgba(244, 63, 94, 0.5) 0%, rgba(225, 29, 72, 0.3) 40%, rgba(159, 18, 57, 0.12) 70%, transparent 85%)',
    glowLeft: 'radial-gradient(circle, rgba(251, 113, 133, 0.35) 0%, transparent 70%)',
    glowRight: 'radial-gradient(circle, rgba(190, 18, 60, 0.35) 0%, transparent 70%)',
    badgeBg: 'bg-rose-500/15',
    badgeText: 'text-rose-300',
    accentColor: 'text-rose-400',
    borderColor: 'border-rose-500/30',
    hoverBorder: 'hover:border-rose-500',
    swatchGradient: 'from-rose-600 via-red-600 to-amber-600',
  },
  emerald: {
    id: 'emerald',
    name: 'Cyber Emerald',
    subtitle: 'Negro profundo con neón esmeralda y verde matrix',
    primaryHex: '#10b981',
    secondaryHex: '#059669',
    accentHex: '#34d399',
    rgb: '16, 185, 129',
    secondaryRgb: '5, 150, 105',
    gradientText: 'from-emerald-400 to-teal-400',
    glowGradient:
      'radial-gradient(ellipse at 50% 100%, rgba(16, 185, 129, 0.5) 0%, rgba(5, 150, 105, 0.3) 40%, rgba(6, 78, 59, 0.12) 70%, transparent 85%)',
    glowLeft: 'radial-gradient(circle, rgba(52, 211, 153, 0.35) 0%, transparent 70%)',
    glowRight: 'radial-gradient(circle, rgba(4, 120, 87, 0.35) 0%, transparent 70%)',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-300',
    accentColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/30',
    hoverBorder: 'hover:border-emerald-500',
    swatchGradient: 'from-emerald-600 via-teal-600 to-cyan-500',
  },
  blue: {
    id: 'blue',
    name: 'Ocean Sapphire',
    subtitle: 'Negro espacial con aurora azul eléctrico y cian',
    primaryHex: '#3b82f6',
    secondaryHex: '#0284c7',
    accentHex: '#60a5fa',
    rgb: '59, 130, 246',
    secondaryRgb: '2, 132, 199',
    gradientText: 'from-blue-400 to-cyan-400',
    glowGradient:
      'radial-gradient(ellipse at 50% 100%, rgba(59, 130, 246, 0.5) 0%, rgba(37, 99, 235, 0.3) 40%, rgba(30, 58, 138, 0.12) 70%, transparent 85%)',
    glowLeft: 'radial-gradient(circle, rgba(96, 165, 250, 0.35) 0%, transparent 70%)',
    glowRight: 'radial-gradient(circle, rgba(29, 78, 216, 0.35) 0%, transparent 70%)',
    badgeBg: 'bg-blue-500/15',
    badgeText: 'text-blue-300',
    accentColor: 'text-blue-400',
    borderColor: 'border-blue-500/30',
    hoverBorder: 'hover:border-blue-500',
    swatchGradient: 'from-blue-600 via-cyan-600 to-sky-500',
  },
  amber: {
    id: 'amber',
    name: 'Solar Amber',
    subtitle: 'Negro mate con destello ámbar y oro cálido',
    primaryHex: '#f59e0b',
    secondaryHex: '#d97706',
    accentHex: '#fbbf24',
    rgb: '245, 158, 11',
    secondaryRgb: '217, 119, 6',
    gradientText: 'from-amber-400 to-yellow-400',
    glowGradient:
      'radial-gradient(ellipse at 50% 100%, rgba(245, 158, 11, 0.5) 0%, rgba(217, 119, 6, 0.3) 40%, rgba(120, 53, 15, 0.12) 70%, transparent 85%)',
    glowLeft: 'radial-gradient(circle, rgba(251, 191, 36, 0.35) 0%, transparent 70%)',
    glowRight: 'radial-gradient(circle, rgba(180, 83, 9, 0.35) 0%, transparent 70%)',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-300',
    accentColor: 'text-amber-400',
    borderColor: 'border-amber-500/30',
    hoverBorder: 'hover:border-amber-500',
    swatchGradient: 'from-amber-600 via-orange-600 to-yellow-500',
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Neon Vaporwave',
    subtitle: 'Fusión vibrante de rosa neón y violeta cyberpunk',
    primaryHex: '#ec4899',
    secondaryHex: '#8b5cf6',
    accentHex: '#f472b6',
    rgb: '236, 72, 153',
    secondaryRgb: '139, 92, 246',
    gradientText: 'from-pink-400 to-purple-400',
    glowGradient:
      'radial-gradient(ellipse at 50% 100%, rgba(236, 72, 153, 0.5) 0%, rgba(168, 85, 247, 0.3) 40%, rgba(6, 182, 212, 0.12) 70%, transparent 85%)',
    glowLeft: 'radial-gradient(circle, rgba(244, 114, 182, 0.35) 0%, transparent 70%)',
    glowRight: 'radial-gradient(circle, rgba(6, 182, 212, 0.35) 0%, transparent 70%)',
    badgeBg: 'bg-pink-500/15',
    badgeText: 'text-pink-300',
    accentColor: 'text-pink-400',
    borderColor: 'border-pink-500/30',
    hoverBorder: 'hover:border-pink-500',
    swatchGradient: 'from-pink-600 via-purple-600 to-cyan-500',
  },
}

export function applyThemeVariables(themeId: SystemTheme) {
  if (typeof document === 'undefined') return
  const theme = SYSTEM_THEMES[themeId] || SYSTEM_THEMES.purple
  const root = document.documentElement

  root.style.setProperty('--theme-primary', theme.primaryHex)
  root.style.setProperty('--theme-secondary', theme.secondaryHex)
  root.style.setProperty('--theme-accent', theme.accentHex)
  root.style.setProperty('--theme-rgb', theme.rgb)
  root.style.setProperty('--theme-secondary-rgb', theme.secondaryRgb)
  root.style.setProperty('--theme-border', `rgba(${theme.rgb}, 0.25)`)
  root.style.setProperty('--theme-border-hover', `rgba(${theme.rgb}, 0.8)`)
  root.style.setProperty('--theme-glow', `rgba(${theme.rgb}, 0.4)`)
  root.style.setProperty('--theme-glow-subtle', `rgba(${theme.rgb}, 0.15)`)
  root.style.setProperty('--theme-badge-bg', `rgba(${theme.rgb}, 0.15)`)
  root.style.setProperty('--theme-badge-text', theme.accentHex)
  root.style.setProperty('--theme-grad-start', theme.primaryHex)
  root.style.setProperty('--theme-grad-end', theme.secondaryHex)
  
  root.setAttribute('data-theme', themeId)
}
