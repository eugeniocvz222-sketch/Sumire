import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { NotebookCard } from './NotebookCard'
import { Plus, BookOpen, GraduationCap, CheckCircle, Sparkles } from 'lucide-react'
import { Subject } from '../../types'
import { NewSubjectModal } from '../modals/NewSubjectModal'
import { MinimalBackground } from '../reactbits/MinimalBackground'
import { ShinyText } from '../reactbits/ShinyText'
import { ClickSpark } from '../reactbits/ClickSpark'
import { SpotlightCard } from '../reactbits/SpotlightCard'
import { ShimmerButton } from '../reactbits/ShimmerButton'

export const NotebookShelf: React.FC = () => {
  const {
    filteredSubjects,
    subjects,
    notes,
    tasks,
    activePeriod,
    selectedSemester,
    setActiveSubjectId,
    setActiveNoteId,
    setActiveView,
    createSubject,
    updateSubject,
  } = useApp()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)

  const pendingTasksTotal = tasks.filter((t) => {
    const isSubjectInPeriod = filteredSubjects.some((s) => s.id === t.subjectId)
    return isSubjectInPeriod && !t.isCompleted
  }).length

  const totalNotesInPeriod = notes.filter((n) =>
    filteredSubjects.some((s) => s.id === n.subjectId)
  ).length

  const handleOpenSubject = (subject: Subject) => {
    setActiveSubjectId(subject.id)
    const subjectNotes = notes.filter((n) => n.subjectId === subject.id)
    if (subjectNotes.length > 0) {
      setActiveNoteId(subjectNotes[0].id)
    } else {
      setActiveNoteId(null)
    }
    setActiveView('subject')
  }

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject)
    setIsModalOpen(true)
  }

  const handleSaveSubject = (data: any) => {
    if (editingSubject) {
      updateSubject(editingSubject.id, data)
    } else {
      createSubject(data)
    }
    setEditingSubject(null)
  }

  return (
    <div className="relative flex-1 overflow-y-auto p-6 md:p-8 bg-[#030306]">
      {/* Ultra-Clean Minimalist Ambient Background */}
      <MinimalBackground />

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* Sleek Minimalist Library Header (21st.dev Glass Capsule Style) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{activePeriod?.name || '7mo Cuatrimestre'}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">{activePeriod?.dateRange || 'Sept - Dic 2026'}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <ShinyText text="Biblioteca de Libretas" speed={4} />
            </h1>
            <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
              Tus materias y apuntes correspondientes a este cuatrimestre, sincronizados en tiempo real.
            </p>
          </div>

          {/* Unified Glass Capsule Metrics & Quick Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Segmented Glass Capsule */}
            <div className="inline-flex items-center bg-[#0d0d1a]/80 border border-white/10 rounded-2xl p-1.5 shadow-xl backdrop-blur-md text-xs font-medium divide-x divide-white/10">
              <div className="flex items-center gap-2 px-3.5 py-1.5">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span className="text-white font-bold">{filteredSubjects.length}</span>
                <span className="text-slate-400 text-[11px] hidden sm:inline">
                  {filteredSubjects.length === 1 ? 'Materia' : 'Materias'}
                </span>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span className="text-white font-bold">{totalNotesInPeriod}</span>
                <span className="text-slate-400 text-[11px] hidden sm:inline">
                  {totalNotesInPeriod === 1 ? 'Apunte' : 'Apuntes'}
                </span>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-1.5">
                <CheckCircle className="w-4 h-4 text-amber-400" />
                <span className="text-white font-bold">{pendingTasksTotal}</span>
                <span className="text-slate-400 text-[11px] hidden sm:inline">
                  {pendingTasksTotal === 1 ? 'Pendiente' : 'Pendientes'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notebooks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Add New Notebook Card (3D Book Slot with Perspective) */}
          <div
            className="relative flex items-center justify-center p-3 select-none h-88 sm:h-92"
            style={{
              perspective: '1200px',
              perspectiveOrigin: '50% 50%',
            }}
          >
            <ClickSpark sparkColor="var(--theme-primary, #c084fc)" sparkCount={12} className="w-full h-full">
              <button
                type="button"
                onClick={() => {
                  setEditingSubject(null)
                  setIsModalOpen(true)
                }}
                className="w-full h-full group relative rounded-r-2xl rounded-l-xs p-6 border-2 border-dashed border-purple-500/30 hover:border-purple-400 bg-[#0c0c16]/80 hover:bg-[#121026] transition-all duration-500 flex flex-col items-center justify-between text-center cursor-pointer backdrop-blur-md shadow-xl hover:shadow-2xl hover:shadow-purple-950/60 overflow-hidden"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: 'rotateX(4deg) rotateY(-8deg)',
                }}
              >
                {/* 3D Spine effect */}
                <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-b from-purple-600/30 via-indigo-600/30 to-purple-600/30 border-r border-dashed border-purple-500/40" />

                {/* Top Tag */}
                <div className="w-full flex justify-end pl-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase font-mono bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    + Nueva
                  </span>
                </div>

                {/* Center Icon & Text */}
                <div className="flex flex-col items-center justify-center my-auto pl-3">
                  <div className="relative mb-3">
                    <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-60 blur-md transition-opacity duration-500" />
                    <div className="relative w-14 h-14 rounded-2xl bg-[#161628] border border-purple-500/40 group-hover:border-transparent group-hover:bg-gradient-to-tr group-hover:from-purple-600 group-hover:to-indigo-600 text-purple-300 group-hover:text-white flex items-center justify-center transition-all duration-500 shadow-lg group-hover:scale-110">
                      <Plus className="w-7 h-7 transition-transform duration-700 ease-out group-hover:rotate-[360deg]" />
                    </div>
                  </div>

                  <h3 className="font-extrabold text-white text-base group-hover:text-purple-200 transition-colors">
                    Crear Nueva Libreta
                  </h3>
                  <p className="text-xs text-slate-400 group-hover:text-slate-200 mt-1 max-w-[190px] leading-relaxed transition-colors">
                    Personaliza textura, color e icono con vista previa al instante
                  </p>
                </div>

                {/* Bottom Divider Indicator */}
                <div className="w-10 h-0.5 rounded-full bg-purple-500/40 group-hover:w-16 group-hover:bg-purple-400 transition-all duration-300 pl-3" />
              </button>
            </ClickSpark>
          </div>

          {/* List of Notebooks */}
          {filteredSubjects.map((subject) => (
            <NotebookCard
              key={subject.id}
              subject={subject}
              onOpen={() => handleOpenSubject(subject)}
              onEdit={() => handleEditSubject(subject)}
            />
          ))}
        </div>
      </div>

      <NewSubjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingSubject(null)
        }}
        onSave={handleSaveSubject}
        editingSubject={editingSubject}
        currentSemester={selectedSemester}
      />
    </div>
  )
}
