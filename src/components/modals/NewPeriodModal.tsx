import React, { useState } from 'react'
import { X, Calendar, Sparkles, GraduationCap, BookOpen } from 'lucide-react'
import { PeriodType } from '../../types'
import { ShimmerButton } from '../reactbits/ShimmerButton'

interface NewPeriodModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { name: string; type: PeriodType; dateRange: string; isCurrent: boolean }) => void
}

export const NewPeriodModal: React.FC<NewPeriodModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('')
  const [type, setType] = useState<PeriodType>('cuatrimestre')
  const [dateRange, setDateRange] = useState('')
  const [isCurrent, setIsCurrent] = useState(true)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onSave({
      name: name.trim(),
      type,
      dateRange: dateRange.trim() || 'Periodo Actual',
      isCurrent,
    })

    setName('')
    setDateRange('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Nuevo Periodo Académico</h2>
              <p className="text-xs text-slate-400">Cuatrimestre, Semestre o Trimestre</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Tipo de Periodo
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('cuatrimestre')
                  if (!name) setName('7mo Cuatrimestre')
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  type === 'cuatrimestre'
                    ? 'bg-purple-600 border-purple-500 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Cuatrimestre</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('semestre')
                  if (!name) setName('1er Semestre')
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  type === 'semestre'
                    ? 'bg-purple-600 border-purple-500 text-white shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Semestre</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Nombre del Periodo *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. 7mo Cuatrimestre, 8vo Cuatrimestre..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1.5">
              Rango de Meses / Ciclo Escolar
            </label>
            <input
              type="text"
              placeholder="Ej. Septiembre - Diciembre 2026, Ene - Abr 2027..."
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 text-sm"
            />
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="isCurrentCheck"
              checked={isCurrent}
              onChange={(e) => setIsCurrent(e.target.checked)}
              className="w-4 h-4 rounded-md accent-indigo-600 cursor-pointer"
            />
            <label htmlFor="isCurrentCheck" className="text-xs text-slate-300 font-medium cursor-pointer">
              Establecer como mi periodo activo actual
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <ShimmerButton
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              Cancelar
            </ShimmerButton>
            <ShimmerButton
              type="submit"
              variant="primary"
              size="sm"
            >
              Crear Periodo
            </ShimmerButton>
          </div>
        </form>
      </div>
    </div>
  )
}
