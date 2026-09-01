import React from 'react'
import {
  BsJournalBookmarkFill,
  BsBookHalf,
  BsCalculatorFill,
  BsCodeSquare,
  BsCpuFill,
  BsMortarboardFill,
  BsDatabaseFillCheck,
  BsBarChartLineFill,
  BsPenFill,
  BsTerminalFill,
  BsFolderFill,
  BsLightbulbFill,
  BsShieldCheck,
  BsGlobeAmericas,
  BsPaletteFill,
  BsGraphUpArrow,
  BsDiagram3Fill,
  BsGearWideConnected,
  BsBraces,
  BsBugFill,
  BsRocketTakeoffFill,
  BsLightningChargeFill,
  BsClockHistory,
  BsCloudCheckFill,
} from 'react-icons/bs'
import { BiAtom, BiDna, BiMath, BiMicrochip } from 'react-icons/bi'
import { IconType } from 'react-icons'

interface IconRendererProps {
  icon: string
  className?: string
  size?: number
}

const ICON_MAP: Record<string, IconType> = {
  // Bootstrap & University Icons
  'journal-bookmark': BsJournalBookmarkFill,
  'book-open': BsBookHalf,
  'calculator': BsCalculatorFill,
  'code': BsCodeSquare,
  'cpu': BsCpuFill,
  'mortarboard': BsMortarboardFill,
  'database': BsDatabaseFillCheck,
  'chart-bar': BsBarChartLineFill,
  'pen-tool': BsPenFill,
  'terminal': BsTerminalFill,
  'folder': BsFolderFill,
  'lightbulb': BsLightbulbFill,
  'shield': BsShieldCheck,
  'globe': BsGlobeAmericas,
  'palette': BsPaletteFill,
  'graph-up': BsGraphUpArrow,
  'diagram': BsDiagram3Fill,
  'gear': BsGearWideConnected,
  'braces': BsBraces,
  'bug': BsBugFill,
  'rocket': BsRocketTakeoffFill,
  'lightning': BsLightningChargeFill,
  'clock': BsClockHistory,
  'cloud': BsCloudCheckFill,
  'atom': BiAtom,
  'dna': BiDna,
  'math': BiMath,
  'microchip': BiMicrochip,
  'flask-conical': BiAtom,
}

export const IconRenderer: React.FC<IconRendererProps> = ({ icon, className = '', size = 20 }) => {
  const IconComponent = ICON_MAP[icon] || BsJournalBookmarkFill
  return <IconComponent className={className} size={size} />
}

export const ALL_UNIVERSITY_ICONS: Array<{ id: string; label: string; group: string }> = [
  { id: 'journal-bookmark', label: 'Libreta Universitaria', group: 'General' },
  { id: 'book-open', label: 'Libro de Texto', group: 'General' },
  { id: 'mortarboard', label: 'Graduación / Carrera', group: 'General' },
  { id: 'calculator', label: 'Cálculo y Matemáticas', group: 'Ciencias' },
  { id: 'math', label: 'Fórmulas y Álgebra', group: 'Ciencias' },
  { id: 'atom', label: 'Física y Química', group: 'Ciencias' },
  { id: 'dna', label: 'Biología y Medicina', group: 'Ciencias' },
  { id: 'code', label: 'Programación', group: 'Ingeniería' },
  { id: 'braces', label: 'Algoritmos y Código', group: 'Ingeniería' },
  { id: 'terminal', label: 'Terminal / Consola', group: 'Ingeniería' },
  { id: 'database', label: 'Bases de Datos', group: 'Ingeniería' },
  { id: 'cpu', label: 'Arquitectura de Computadoras', group: 'Ingeniería' },
  { id: 'microchip', label: 'Sistemas Embebidos', group: 'Ingeniería' },
  { id: 'diagram', label: 'Estructuras y Redes', group: 'Ingeniería' },
  { id: 'chart-bar', label: 'Estadística y Finanzas', group: 'Negocios' },
  { id: 'graph-up', label: 'Economía y Proyectos', group: 'Negocios' },
  { id: 'shield', label: 'Ciberseguridad', group: 'Ingeniería' },
  { id: 'palette', label: 'Diseño y Arte', group: 'Creatividad' },
  { id: 'pen-tool', label: 'Redacción y Ensayos', group: 'Creatividad' },
  { id: 'globe', label: 'Idiomas y Geografía', group: 'Humanidades' },
  { id: 'lightbulb', label: 'Innovación / Tesis', group: 'General' },
  { id: 'rocket', label: 'Proyecto Final', group: 'General' },
  { id: 'lightning', label: 'Circuitos Eléctricos', group: 'Ingeniería' },
  { id: 'gear', label: 'Ingeniería Industrial', group: 'Ingeniería' },
]
