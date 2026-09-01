import React, { useState, useEffect } from 'react'
import {
  X,
  Plus,
  Trash2,
  Sparkles,
  Rotate3d,
  Compass,
  Layers,
  Palette,
  BookOpen,
  User,
  MapPin,
  Clock,
  Code,
} from 'lucide-react'
import { Subject, SubjectColor, SubjectIcon } from '../../types'
import { IconRenderer, ALL_UNIVERSITY_ICONS } from '../common/IconRenderer'
import { COLOR_SCHEMES } from '../common/ColorMap'
import { ShimmerButton } from '../reactbits/ShimmerButton'
import { Book3D, BookPattern } from '../reactbits/Book3D'
import { ClickSpark } from '../reactbits/ClickSpark'

interface NewSubjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (subjectData: {
    name: string
    code: string
    professor?: string
    classroom?: string
    schedule?: string
    color: SubjectColor
    icon: SubjectIcon
    pattern?: BookPattern
    semester: string
    description?: string
    initialUnits?: string[]
  }) => void
  editingSubject?: Subject | null
  currentSemester: string
}

const PATTERNS: { id: BookPattern; label: string; desc: string }[] = [
  { id: 'minimal', label: 'Minimal Clean', desc: 'Resplandor suave y elegante' },
  { id: 'grid', label: 'Cuadrícula Técnica', desc: 'Líneas milimétricas para ingeniería' },
  { id: 'dots', label: 'Matriz de Puntos', desc: 'Estilo libreta Bullet Journal' },
  { id: 'blueprint', label: 'Blueprint', desc: 'Esquema técnico de arquitectura' },
  { id: 'wave', label: 'Ondas Japonesas', desc: 'Estética anime / fluida' },
  { id: 'hologram', label: 'Holograma Cyber', desc: 'Reflejos futuristas neón' },
]

export const NewSubjectModal: React.FC<NewSubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingSubject,
  currentSemester,
}) => {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [professor, setProfessor] = useState('')
  const [classroom, setClassroom] = useState('')
  const [schedule, setSchedule] = useState('')
  const [color, setColor] = useState<SubjectColor>('violet')
  const [icon, setIcon] = useState<string>('code')
  const [pattern, setPattern] = useState<BookPattern>('minimal')
  const [description, setDescription] = useState('')
  const [units, setUnits] = useState<string[]>(['Unidad 1', 'Unidad 2', 'Unidad 3'])
  const [newUnitInput, setNewUnitInput] = useState('')

  // 3D Preview Angle Controls
  const [angleY, setAngleY] = useState(-18)
  const [angleX, setAngleX] = useState(6)

  useEffect(() => {
    if (editingSubject) {
      setName(editingSubject.name)
      setCode(editingSubject.code)
      setProfessor(editingSubject.professor || '')
      setClassroom(editingSubject.classroom || '')
      setSchedule(editingSubject.schedule || '')
      setColor(editingSubject.color)
      setIcon(editingSubject.icon || 'code')
      setPattern((editingSubject.pattern as BookPattern) || 'minimal')
      setDescription(editingSubject.description || '')
      setUnits(editingSubject.units || ['Unidad 1', 'Unidad 2', 'Unidad 3'])
    } else {
      setName('')
      setCode('')
      setProfessor('')
      setClassroom('')
      setSchedule('')
      setColor('violet')
      setIcon('code')
      setPattern('minimal')
      setDescription('')
      setUnits(['Unidad 1', 'Unidad 2', 'Unidad 3'])
    }
  }, [editingSubject, currentSemester, isOpen])

  if (!isOpen) return null

  const handleAddUnit = () => {
    if (newUnitInput.trim()) {
      setUnits([...units, newUnitInput.trim()])
      setNewUnitInput('')
    }
  }

  const handleRemoveUnit = (index: number) => {
    setUnits(units.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onSave({
      name: name.trim(),
      code: code.trim() || 'MAT-101',
      professor: professor.trim() || undefined,
      classroom: classroom.trim() || undefined,
      schedule: schedule.trim() || undefined,
      color,
      icon: icon as SubjectIcon,
      pattern,
      semester: currentSemester,
      description: description.trim() || undefined,
      initialUnits: units.length > 0 ? units : ['Unidad 1'],
    })
    onClose()
  }

  const activeScheme = COLOR_SCHEMES[color] || COLOR_SCHEMES.violet

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-5xl bg-[#080811] border border-purple-500/30 rounded-3xl shadow-2xl shadow-purple-950/60 overflow-hidden flex flex-col my-auto max-h-[90vh]"
      >
        {/* Top Header */}
        <div className="p-5 px-6 border-b border-white/5 bg-linear-to-r from-purple-950/40 via-black/60 to-black/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <Rotate3d className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
                <span>{editingSubject ? 'Editar Libreta' : 'Diseñador de Libreta'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                  Tiempo Real
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Personaliza la textura, lomo, paleta de color y visualiza los cambios al instante
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2-COLUMN STUDIO WORKSPACE */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* LEFT COLUMN: CUSTOMIZATION FORM (7 COLS) */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 p-6 space-y-5 overflow-y-auto max-h-[75vh] border-r border-white/5"
          >
            {/* Subject Name and Code */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Nombre de la Materia *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Cálculo Diferencial, Redes..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0e0e1a] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 text-xs sm:text-sm font-semibold transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Código / Sigla
                </label>
                <input
                  type="text"
                  placeholder="MAT-201"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0e0e1a] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 text-xs sm:text-sm font-mono font-bold uppercase transition"
                />
              </div>
            </div>

            {/* Color Palette Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider flex items-center justify-between">
                <span>Color de Portada y Lomo</span>
                <span className="text-[10px] text-purple-300 font-normal">{activeScheme.label}</span>
              </label>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {Object.values(COLOR_SCHEMES).map((scheme) => (
                  <button
                    key={scheme.id}
                    type="button"
                    onClick={() => setColor(scheme.id)}
                    className={`h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      color === scheme.id
                        ? 'ring-2 ring-white scale-110 shadow-lg shadow-purple-900/40 z-10'
                        : 'opacity-70 hover:opacity-100 hover:scale-105'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${
                        scheme.id === 'emerald'
                          ? '#059669'
                          : scheme.id === 'blue'
                          ? '#2563eb'
                          : scheme.id === 'violet'
                          ? '#7c3aed'
                          : scheme.id === 'amber'
                          ? '#d97706'
                          : scheme.id === 'rose'
                          ? '#e11d48'
                          : scheme.id === 'cyan'
                          ? '#0891b2'
                          : scheme.id === 'indigo'
                          ? '#4f46e5'
                          : scheme.id === 'orange'
                          ? '#ea580c'
                          : scheme.id === 'fuchsia'
                          ? '#c026d3'
                          : '#475569'
                      }, #0f172a)`,
                    }}
                    title={scheme.label}
                  />
                ))}
              </div>
            </div>

            {/* Pattern Texture Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                <span>Patrón de Portada</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PATTERNS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPattern(p.id)}
                    className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      pattern === p.id
                        ? 'bg-purple-950/50 border-purple-400 ring-1 ring-purple-500/50 shadow-xs'
                        : 'bg-[#0a0a14] border-white/10 hover:border-white/20 text-slate-300'
                    }`}
                  >
                    <span className={`text-xs font-bold ${pattern === p.id ? 'text-purple-200' : 'text-white'}`}>
                      {p.label}
                    </span>
                    <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{p.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider flex items-center justify-between">
                <span>Icono Central de Portada</span>
                <span className="text-[10px] text-slate-400">{ALL_UNIVERSITY_ICONS.length} iconos disponibles</span>
              </label>
              <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 bg-[#090912] p-2.5 rounded-2xl border border-white/10 max-h-32 overflow-y-auto">
                {ALL_UNIVERSITY_ICONS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIcon(item.id)}
                    title={`${item.label} (${item.group})`}
                    className={`p-2.5 rounded-xl flex items-center justify-center transition cursor-pointer ${
                      icon === item.id
                        ? `${activeScheme.badgeBg} ${activeScheme.accentColor} border ${activeScheme.borderColor} scale-105 shadow-xs`
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <IconRenderer icon={item.id} size={20} />
                  </button>
                ))}
              </div>
            </div>

            {/* Academic Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Profesor(a)
                </label>
                <input
                  type="text"
                  placeholder="Ej. Dr. Martínez"
                  value={professor}
                  onChange={(e) => setProfessor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0e0e1a] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 text-xs sm:text-sm transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Aula / Laboratorio
                </label>
                <input
                  type="text"
                  placeholder="Ej. Lab 2 / Aula 104"
                  value={classroom}
                  onChange={(e) => setClassroom(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0e0e1a] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 text-xs sm:text-sm transition"
                />
              </div>
            </div>

            {/* Units / Parciales */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Unidades o Parciales de la Materia
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Nueva unidad..."
                  value={newUnitInput}
                  onChange={(e) => setNewUnitInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddUnit()
                    }
                  }}
                  className="flex-1 px-3.5 py-2 bg-[#0e0e1a] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 text-xs transition"
                />
                <button
                  type="button"
                  onClick={handleAddUnit}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl flex items-center gap-1.5 text-xs font-semibold transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Agregar
                </button>
              </div>

              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {units.map((unit, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-950/40 border border-purple-500/30 rounded-lg text-xs text-purple-200"
                  >
                    {unit}
                    <button
                      type="button"
                      onClick={() => handleRemoveUnit(idx)}
                      className="text-slate-400 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition cursor-pointer"
              >
                Cancelar
              </button>
              <ClickSpark sparkColor="var(--theme-primary, #c084fc)" sparkCount={12}>
                <ShimmerButton type="submit" variant="primary" size="md">
                  {editingSubject ? 'Guardar Cambios' : 'Crear Libreta'}
                </ShimmerButton>
              </ClickSpark>
            </div>
          </form>

          {/* RIGHT COLUMN: 3D REAL-TIME STUDIO PREVIEW (5 COLS) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-[#05050c] to-[#0a0a16] p-6 flex flex-col justify-between items-center text-center select-none overflow-hidden relative">
            {/* Top Studio Badge */}
            <div className="w-full flex items-center justify-between z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                Render en Vivo
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Rotación: {angleY}°
              </span>
            </div>

            {/* 3D BOOK LIVE CANVAS */}
            <div className="w-full flex-1 flex items-center justify-center my-4">
              <Book3D
                title={name || 'Título de Materia'}
                code={code || 'MAT-101'}
                color={color}
                icon={icon}
                semester={currentSemester}
                professor={professor}
                classroom={classroom}
                pattern={pattern}
                size="preview"
                rotateY={angleY}
                rotateX={angleX}
                isHoverable={false}
              />
            </div>

            {/* Angle Preset Controls */}
            <div className="w-full space-y-3 z-10 bg-black/40 p-4 rounded-2xl border border-white/5 backdrop-blur-xs">
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Ángulos de Inspección</span>
                <Compass className="w-3.5 h-3.5 text-purple-400" />
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setAngleY(-18)
                    setAngleX(6)
                  }}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    angleY === -18 ? 'bg-purple-600 text-white font-bold' : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  Frontal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAngleY(-75)
                    setAngleX(2)
                  }}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    angleY === -75 ? 'bg-purple-600 text-white font-bold' : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  Lomo
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAngleY(-38)
                    setAngleX(16)
                  }}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    angleY === -38 ? 'bg-purple-600 text-white font-bold' : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  Isométrica
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAngleY(0)
                    setAngleX(0)
                  }}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    angleY === 0 ? 'bg-purple-600 text-white font-bold' : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  Plano
                </button>
              </div>

              {/* Angle Slider */}
              <div className="flex items-center gap-3 pt-1">
                <span className="text-[10px] text-slate-400 font-mono">-90°</span>
                <input
                  type="range"
                  min="-90"
                  max="90"
                  value={angleY}
                  onChange={(e) => setAngleY(Number(e.target.value))}
                  className="flex-1 accent-purple-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <span className="text-[10px] text-slate-400 font-mono">+90°</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
