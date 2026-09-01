import React, { useState, useMemo, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import { COLOR_SCHEMES } from '../common/ColorMap'
import { IconRenderer } from '../common/IconRenderer'
import {
  Calendar,
  Clock,
  Plus,
  X,
  MapPin,
  User,
  Trash2,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import { MinimalBackground } from '../reactbits/MinimalBackground'

// ─── Types ───
interface ScheduleBlock {
  id: string
  day: number
  startHour: number
  startMin: number
  endHour: number
  endMin: number
  subjectId?: string
  customName?: string
  professor?: string
  classroom?: string
}

// ─── Constants ───
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const DAY_ABBR = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const STORAGE_KEY_PREFIX = 'apuntes_schedule_'
const toMin = (h: number, m: number) => h * 60 + m
const fmt = (h: number, m: number) =>
  `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`

// ─── Digital Time Picker (compact) ───
const DigitalTimePicker: React.FC<{
  hour: number
  minute: number
  onChangeHour: (h: number) => void
  onChangeMinute: (m: number) => void
  label: string
}> = ({ hour, minute, onChangeHour, onChangeMinute, label }) => {
  const incH = () => onChangeHour(hour >= 22 ? 6 : hour + 1)
  const decH = () => onChangeHour(hour <= 6 ? 22 : hour - 1)
  const incM = () => {
    const n = minute >= 45 ? 0 : minute + 15
    if (n === 0) incH()
    else onChangeMinute(n)
  }
  const decM = () => {
    if (minute === 0) {
      decH()
      onChangeMinute(45)
    } else {
      onChangeMinute(minute - 15)
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      <div className="flex items-center gap-0.5 bg-slate-950 border border-slate-700 rounded-xl p-1.5">
        <div className="flex flex-col items-center">
          <button type="button" onClick={incH} className="w-8 h-5 flex items-center justify-center rounded hover:bg-indigo-600/30 text-slate-500 hover:text-white transition cursor-pointer"><ChevronUp className="w-3.5 h-3.5" /></button>
          <div className="w-10 h-9 rounded-lg bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center">
            <span className="text-lg font-black text-white tabular-nums font-mono">{hour.toString().padStart(2, '0')}</span>
          </div>
          <button type="button" onClick={decH} className="w-8 h-5 flex items-center justify-center rounded hover:bg-indigo-600/30 text-slate-500 hover:text-white transition cursor-pointer"><ChevronDown className="w-3.5 h-3.5" /></button>
        </div>
        <div className="flex flex-col items-center gap-1 px-0.5">
          <div className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" />
          <div className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" />
        </div>
        <div className="flex flex-col items-center">
          <button type="button" onClick={incM} className="w-8 h-5 flex items-center justify-center rounded hover:bg-indigo-600/30 text-slate-500 hover:text-white transition cursor-pointer"><ChevronUp className="w-3.5 h-3.5" /></button>
          <div className="w-10 h-9 rounded-lg bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-center">
            <span className="text-lg font-black text-white tabular-nums font-mono">{minute.toString().padStart(2, '0')}</span>
          </div>
          <button type="button" onClick={decM} className="w-8 h-5 flex items-center justify-center rounded hover:bg-indigo-600/30 text-slate-500 hover:text-white transition cursor-pointer"><ChevronDown className="w-3.5 h-3.5" /></button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───
export const ScheduleView: React.FC = () => {
  const { filteredSubjects, activePeriod, activePeriodId, user } = useApp()
  const storageKey = `${STORAGE_KEY_PREFIX}${user?.id || 'anon'}_${activePeriodId}`

  const [blocks, setBlocks] = useState<ScheduleBlock[]>(() => {
    try {
      const s = localStorage.getItem(storageKey)
      return s ? JSON.parse(s) : []
    } catch { return [] }
  })

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(blocks)) }, [blocks, storageKey])
  useEffect(() => {
    try { const s = localStorage.getItem(storageKey); setBlocks(s ? JSON.parse(s) : []) }
    catch { setBlocks([]) }
  }, [storageKey])

  // ─── Modal ───
  const [showModal, setShowModal] = useState(false)
  const [modalDay, setModalDay] = useState(0)
  const [mSH, setMSH] = useState(17)
  const [mSM, setMSM] = useState(30)
  const [mEH, setMEH] = useState(18)
  const [mEM, setMEM] = useState(15)
  const [mSubId, setMSubId] = useState('')
  const [mName, setMName] = useState('')
  const [mProf, setMProf] = useState('')
  const [mRoom, setMRoom] = useState('')
  const [editId, setEditId] = useState<string | null>(null)

  const openAdd = (day: number) => {
    setModalDay(day)
    setMSH(17); setMSM(30); setMEH(18); setMEM(15)
    setMSubId(''); setMName(''); setMProf(''); setMRoom('')
    setEditId(null); setShowModal(true)
  }

  const openEdit = (b: ScheduleBlock) => {
    setModalDay(b.day); setMSH(b.startHour); setMSM(b.startMin)
    setMEH(b.endHour); setMEM(b.endMin)
    setMSubId(b.subjectId || ''); setMName(b.customName || '')
    setMProf(b.professor || ''); setMRoom(b.classroom || '')
    setEditId(b.id); setShowModal(true)
  }

  const save = () => {
    const name = mSubId ? filteredSubjects.find(s => s.id === mSubId)?.name || '' : mName.trim()
    if (!name || toMin(mEH, mEM) <= toMin(mSH, mSM)) return
    const payload: ScheduleBlock = {
      id: editId || `sb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      day: modalDay, startHour: mSH, startMin: mSM, endHour: mEH, endMin: mEM,
      subjectId: mSubId || undefined, customName: mSubId ? undefined : mName.trim(),
      professor: mProf.trim() || undefined, classroom: mRoom.trim() || undefined,
    }
    setBlocks(prev => editId ? prev.map(b => b.id === editId ? payload : b) : [...prev, payload])
    setShowModal(false)
  }

  const del = (id: string) => { setBlocks(prev => prev.filter(b => b.id !== id)); setShowModal(false) }

  const pickSubject = (id: string) => {
    setMSubId(id)
    if (id) {
      const sub = filteredSubjects.find(s => s.id === id)
      if (sub?.professor && !mProf) setMProf(sub.professor)
      if (sub?.classroom && !mRoom) setMRoom(sub.classroom)
      setMName('')
    }
  }

  // ─── Group blocks by day, sorted by time ───
  const dayBlocks = useMemo(() => {
    const map: Record<number, ScheduleBlock[]> = {}
    DAYS.forEach((_, i) => { map[i] = [] })
    blocks.forEach(b => { if (map[b.day]) map[b.day].push(b) })
    Object.values(map).forEach(arr => arr.sort((a, b) => toMin(a.startHour, a.startMin) - toMin(b.startHour, b.startMin)))
    return map
  }, [blocks])

  const profs = useMemo(() => {
    const s = new Set<string>()
    filteredSubjects.forEach(sub => { if (sub.professor) s.add(sub.professor) })
    blocks.forEach(b => { if (b.professor) s.add(b.professor) })
    return Array.from(s)
  }, [filteredSubjects, blocks])

  const getColor = (b: ScheduleBlock) => {
    if (b.subjectId) {
      const sub = filteredSubjects.find(s => s.id === b.subjectId)
      if (sub) return COLOR_SCHEMES[sub.color] || COLOR_SCHEMES.emerald
    }
    return COLOR_SCHEMES.indigo
  }

  return (
    <div className="relative flex-1 overflow-y-auto p-4 md:p-6 bg-[#030306]">
      <MinimalBackground />
      <div className="relative z-10 max-w-[1400px] mx-auto space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>{activePeriod?.name || 'Periodo Activo'} • {activePeriod?.dateRange || 'Ciclo Escolar'}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Horario de Clases</h1>
            <p className="text-xs text-slate-400">Haz clic en el <strong>+</strong> de un día para agregar una clase</p>
          </div>
        </div>

        {/* ═══════════════ DAY COLUMNS ═══════════════ */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {DAYS.map((day, di) => {
            const dayList = dayBlocks[di] || []
            return (
              <div key={day} className="flex flex-col bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
                {/* Day Header */}
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800 bg-slate-900/80">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    <span className="hidden lg:inline">{day}</span>
                    <span className="lg:hidden">{DAY_ABBR[di]}</span>
                  </h3>
                  <button
                    onClick={() => openAdd(di)}
                    className="w-6 h-6 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white flex items-center justify-center transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Class Cards */}
                <div className="p-2 space-y-2 flex-1 min-h-[120px]">
                  {dayList.length === 0 ? (
                    <button
                      onClick={() => openAdd(di)}
                      className="w-full py-8 flex flex-col items-center justify-center text-slate-600 hover:text-indigo-400 transition cursor-pointer rounded-xl hover:bg-indigo-950/20"
                    >
                      <Plus className="w-5 h-5 mb-1" />
                      <span className="text-[10px] font-medium">Agregar</span>
                    </button>
                  ) : (
                    dayList.map(block => {
                      const scheme = getColor(block)
                      const sub = block.subjectId ? filteredSubjects.find(s => s.id === block.subjectId) : null
                      const name = sub?.name || block.customName || '—'
                      const prof = block.professor || sub?.professor || ''
                      const room = block.classroom || sub?.classroom || ''
                      const time = `${fmt(block.startHour, block.startMin)} - ${fmt(block.endHour, block.endMin)}`

                      return (
                        <button
                          key={block.id}
                          onClick={() => openEdit(block)}
                          className={`w-full text-left p-2.5 rounded-xl border transition cursor-pointer hover:scale-[1.02] hover:brightness-125 ${scheme.cardBg} ${scheme.borderColor}`}
                        >
                          {/* Time badge */}
                          <div className="flex items-center gap-1 mb-1.5">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span className="text-[10px] font-mono font-semibold text-slate-400">{time}</span>
                          </div>

                          {/* Subject name */}
                          <div className="flex items-start gap-1.5">
                            {sub && (
                              <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${scheme.badgeBg} ${scheme.accentColor}`}>
                                <IconRenderer icon={sub.icon} className="w-3 h-3" />
                              </div>
                            )}
                            <p className={`text-[11px] font-bold leading-tight ${scheme.accentColor}`}>{name}</p>
                          </div>

                          {/* Prof & Room */}
                          {prof && (
                            <p className="text-[9px] text-slate-400 mt-1 truncate flex items-center gap-0.5">
                              <User className="w-2.5 h-2.5 shrink-0 text-slate-500" />
                              {prof}
                            </p>
                          )}
                          {room && (
                            <p className="text-[9px] text-slate-500 truncate flex items-center gap-0.5">
                              <MapPin className="w-2.5 h-2.5 shrink-0" />
                              {room}
                            </p>
                          )}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Professor Legend */}
        {profs.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Profesores:</span>
            {profs.map(p => (
              <span key={p} className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/50">
                <User className="w-3 h-3 inline mr-1 text-slate-500" />{p}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ═══════════════ MODAL ═══════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                {editId ? 'Editar Clase' : 'Agregar Clase'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Day */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Día</label>
                <div className="grid grid-cols-6 gap-1">
                  {DAYS.map((_, i) => (
                    <button key={i} type="button" onClick={() => setModalDay(i)}
                      className={`px-1 py-2 rounded-lg text-[11px] font-semibold transition cursor-pointer ${modalDay === i ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'}`}
                    >{DAY_ABBR[i]}</button>
                  ))}
                </div>
              </div>

              {/* Digital Time Pickers */}
              <div className="flex items-center justify-center gap-4">
                <DigitalTimePicker label="Inicio" hour={mSH} minute={mSM} onChangeHour={setMSH} onChangeMinute={setMSM} />
                <div className="flex flex-col items-center gap-1 pt-4">
                  <div className="w-6 h-px bg-slate-600" />
                  <span className="text-[9px] text-slate-500 font-bold">A</span>
                  <div className="w-6 h-px bg-slate-600" />
                </div>
                <DigitalTimePicker label="Fin" hour={mEH} minute={mEM} onChangeHour={setMEH} onChangeMinute={setMEM} />
              </div>

              {toMin(mEH, mEM) <= toMin(mSH, mSM) && (
                <p className="text-center text-xs text-red-400">⚠ La hora fin debe ser posterior al inicio</p>
              )}

              {/* Subject */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Materia</label>
                {filteredSubjects.length > 0 && (
                  <select value={mSubId} onChange={e => pickSubject(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 mb-2 cursor-pointer">
                    <option value="">— Escribir manualmente —</option>
                    {filteredSubjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                  </select>
                )}
                {!mSubId && (
                  <input type="text" placeholder="Nombre de la materia..." value={mName} onChange={e => setMName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
                )}
              </div>

              {/* Professor */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Profesor</label>
                <input type="text" placeholder="Nombre del profesor..." value={mProf} onChange={e => setMProf(e.target.value)} list="prof-sug"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
                <datalist id="prof-sug">{profs.map(p => <option key={p} value={p} />)}</datalist>
              </div>

              {/* Classroom */}
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Aula / Salón</label>
                <input type="text" placeholder="Ej: Aula A-201, Lab 3..." value={mRoom} onChange={e => setMRoom(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
              {editId && (
                <button onClick={() => del(editId)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />Eliminar
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer">Cancelar</button>
                <button onClick={save}
                  disabled={(!mSubId && !mName.trim()) || toMin(mEH, mEM) <= toMin(mSH, mSM)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition shadow-lg cursor-pointer">
                  {editId ? 'Guardar' : 'Agregar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
