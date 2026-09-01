import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { NoteEditor } from '../editor/NoteEditor'
import { IconRenderer } from '../common/IconRenderer'
import { COLOR_SCHEMES } from '../common/ColorMap'
import {
  ArrowLeft,
  Plus,
  Search,
  FileText,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronDown,
  ChevronRight,
  Star,
  Clock,
  Edit2,
  Trash2,
  AlertCircle,
  Sparkles,
  MapPin,
  UserCheck,
  BookOpen,
} from 'lucide-react'
import { NewSubjectModal } from '../modals/NewSubjectModal'
import { PriorityLevel, TaskType } from '../../types'
import { ShimmerButton } from '../reactbits/ShimmerButton'
import { MinimalBackground } from '../reactbits/MinimalBackground'

export const SubjectView: React.FC = () => {
  const {
    activeSubject,
    notes,
    tasks,
    activeNoteId,
    setActiveNoteId,
    setActiveView,
    createNote,
    deleteNote,
    createTask,
    toggleTask,
    deleteTask,
    updateSubject,
  } = useApp()

  const [activeTab, setActiveTab] = useState<'notes' | 'tasks' | 'info'>('notes')
  const [noteSearch, setNoteSearch] = useState('')
  const [selectedUnit, setSelectedUnit] = useState<string>('Todas')
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Task creation form state
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskType, setTaskType] = useState<TaskType>('task')
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0])
  const [taskPriority, setTaskPriority] = useState<PriorityLevel>('medium')

  if (!activeSubject) {
    return (
      <div className="relative flex-1 flex flex-col items-center justify-center p-8 bg-[#030306] text-slate-400">
        <MinimalBackground />
        <div className="relative z-10 text-center space-y-4 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center mx-auto text-purple-400 shadow-xl">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Libreta no encontrada</h3>
            <p className="text-xs text-slate-400 mt-1">
              Esta libreta no existe o pertenece a otro periodo. Regresa a tus materias activas.
            </p>
          </div>
          <ShimmerButton
            onClick={() => setActiveView('shelf')}
            variant="primary"
            size="md"
            icon={<ArrowLeft className="w-4 h-4" />}
          >
            Volver a Mis Libretas
          </ShimmerButton>
        </div>
      </div>
    )
  }

  const scheme = COLOR_SCHEMES[activeSubject.color] || COLOR_SCHEMES.emerald

  // Notes for this subject
  const subjectNotes = notes.filter((n) => n.subjectId === activeSubject.id)
  const filteredNotes = subjectNotes.filter((n) => {
    const matchesUnit = selectedUnit === 'Todas' || n.unit === selectedUnit
    const matchesSearch =
      noteSearch.trim() === '' ||
      n.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(noteSearch.toLowerCase()))
    return matchesUnit && matchesSearch
  })

  // Tasks for this subject
  const subjectTasks = tasks.filter((t) => t.subjectId === activeSubject.id)

  const handleCreateNote = () => {
    const defaultUnit = selectedUnit !== 'Todas' ? selectedUnit : activeSubject.units[0] || 'Unidad 1'
    const newNote = createNote(activeSubject.id, defaultUnit)
    setActiveNoteId(newNote.id)
  }

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!taskTitle.trim()) return

    createTask({
      subjectId: activeSubject.id,
      title: taskTitle.trim(),
      type: taskType,
      dueDate: taskDueDate,
      priority: taskPriority,
    })

    setTaskTitle('')
    setIsAddingTask(false)
  }

  return (
    <div className="relative flex-1 flex flex-col h-full bg-[#030306] overflow-hidden">
      <MinimalBackground />
      {/* Subject Header Banner */}
      <div
        className={`px-6 py-4 border-b border-slate-800/80 bg-linear-to-r ${scheme.bgGradient} flex flex-wrap items-center justify-between gap-4 shrink-0`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveView('shelf')}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-slate-400 hover:text-white border border-slate-800 transition"
            title="Volver al Estante"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center bg-slate-900/90 border ${scheme.borderColor} ${scheme.accentColor} shadow-md`}
          >
            <IconRenderer icon={activeSubject.icon} className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase font-mono ${scheme.badgeBg} ${scheme.badgeText}`}>
                {activeSubject.code}
              </span>
              <h2 className="text-lg font-bold text-white leading-tight">
                {activeSubject.name}
              </h2>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
              {activeSubject.professor && (
                <span className="flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>{activeSubject.professor}</span>
                </span>
              )}
              {activeSubject.classroom && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-purple-400" />
                  <span>{activeSubject.classroom}</span>
                </span>
              )}
              {activeSubject.schedule && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>{activeSubject.schedule}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs & Actions */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'notes'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Apuntes ({subjectNotes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'tasks'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Tareas & Exámenes ({subjectTasks.filter((t) => !t.isCompleted).length})</span>
            </button>

            <button
              onClick={() => setActiveTab('info')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'info'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Temario</span>
            </button>
          </div>

          <button
            onClick={() => setIsEditModalOpen(true)}
            className="p-2 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl transition"
            title="Editar detalles de la materia"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'notes' && (
          <>
            {/* Left Column: Notes List Sidebar */}
            <div className="w-80 border-r border-slate-800/80 bg-slate-900/40 flex flex-col h-full shrink-0">
              {/* Note actions: Search & New Note */}
              <div className="p-3 border-b border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Buscar en esta libreta..."
                      value={noteSearch}
                      onChange={(e) => setNoteSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <ShimmerButton
                    onClick={handleCreateNote}
                    variant="primary"
                    size="sm"
                    icon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Apunte
                  </ShimmerButton>
                </div>

                {/* Unit Filter dropdown */}
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px] text-slate-300 font-medium focus:outline-hidden"
                >
                  <option value="Todas">Todas las Unidades / Parciales</option>
                  {activeSubject.units.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {filteredNotes.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs px-4">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="font-semibold text-slate-400">No hay apuntes todavía</p>
                    <p className="mt-1">Haz clic en &ldquo;+&rdquo; para redactar tu primera nota de clase.</p>
                  </div>
                ) : (
                  filteredNotes.map((note) => (
                    <button
                      key={note.id}
                      onClick={() => setActiveNoteId(note.id)}
                      className={`w-full text-left p-3 rounded-xl transition flex flex-col gap-1 border ${
                        activeNoteId === note.id
                          ? 'bg-indigo-600/15 border-indigo-500/40 shadow-sm'
                          : 'bg-slate-900/60 hover:bg-slate-900 border-transparent hover:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`font-semibold text-xs truncate ${
                            activeNoteId === note.id ? 'text-indigo-300' : 'text-white'
                          }`}
                        >
                          {note.title || 'Sin título'}
                        </span>
                        {note.isFavorite && (
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                        )}
                      </div>

                      <div className="text-[11px] text-slate-400 truncate">
                        {note.unit}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                        <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                        {note.tags.length > 0 && (
                          <span className="truncate max-w-[100px] text-slate-400">
                            #{note.tags[0]}
                          </span>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Note Editor */}
            <NoteEditor />
          </>
        )}

        {/* Tasks & Exams Tab */}
        {activeTab === 'tasks' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-4xl mx-auto space-y-6">
            {/* Header & Add Task trigger */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">Tareas, Proyectos y Exámenes</h3>
                <p className="text-xs text-slate-400">
                  Control de entregas y evaluaciones para {activeSubject.name}
                </p>
              </div>
              <ShimmerButton
                onClick={() => setIsAddingTask(true)}
                variant="primary"
                size="md"
                icon={<Plus className="w-4 h-4" />}
              >
                Nueva Entrega
              </ShimmerButton>
            </div>

            {/* Add Task Form Modal / Inline */}
            {isAddingTask && (
              <form
                onSubmit={handleCreateTask}
                className="p-5 bg-slate-900 border border-indigo-500/30 rounded-2xl space-y-4 shadow-xl"
              >
                <h4 className="text-sm font-bold text-white">Agregar Nueva Tarea / Examen</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-300 mb-1">Título de la actividad *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Tarea 3 de Listas Enlazadas..."
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Tipo</label>
                    <select
                      value={taskType}
                      onChange={(e) => setTaskType(e.target.value as TaskType)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden"
                    >
                      <option value="task">Tarea</option>
                      <option value="exam">Examen</option>
                      <option value="project">Proyecto</option>
                      <option value="quiz">Quiz</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Fecha de Entrega</label>
                    <input
                      type="date"
                      value={taskDueDate}
                      onChange={(e) => setTaskDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <ShimmerButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsAddingTask(false)}
                  >
                    Cancelar
                  </ShimmerButton>
                  <ShimmerButton
                    type="submit"
                    variant="primary"
                    size="sm"
                  >
                    Guardar
                  </ShimmerButton>
                </div>
              </form>
            )}

            {/* Tasks List */}
            <div className="space-y-2">
              {subjectTasks.length === 0 ? (
                <div className="py-16 text-center text-slate-500 text-sm">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-40 text-emerald-400" />
                  <p className="font-semibold text-slate-300">¡Todo al día en {activeSubject.name}!</p>
                  <p className="text-xs text-slate-500 mt-1">No tienes tareas o exámenes pendientes registrados.</p>
                </div>
              ) : (
                subjectTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border transition flex items-center justify-between gap-3 ${
                      task.isCompleted
                        ? 'bg-slate-950/40 border-slate-800/50 opacity-60'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 ${
                          task.isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-700 hover:border-indigo-500'
                        }`}
                      >
                        {task.isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </button>

                      <div className="min-w-0">
                        <h4
                          className={`text-sm font-semibold truncate ${
                            task.isCompleted ? 'line-through text-slate-500' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                          <span className="capitalize font-medium text-slate-300">
                            {task.type === 'exam' ? 'Examen' : task.type === 'project' ? 'Proyecto' : task.type === 'quiz' ? 'Quiz' : 'Tarea'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-purple-400" />
                            <span>Entrega: {task.dueDate}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Temario & Info Tab */}
        {activeTab === 'info' && (
          <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Información de la Asignatura</h3>
              {activeSubject.description && (
                <p className="text-sm text-slate-300 leading-relaxed">
                  {activeSubject.description}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-500 block">Profesor(a)</span>
                  <span className="text-sm font-semibold text-slate-200">
                    {activeSubject.professor || 'No especificado'}
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-500 block">Aula / Ubicación</span>
                  <span className="text-sm font-semibold text-slate-200">
                    {activeSubject.classroom || 'No especificada'}
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-500 block">Horario</span>
                  <span className="text-sm font-semibold text-slate-200">
                    {activeSubject.schedule || 'No especificado'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold text-white">Unidades y Temario</h3>
              <div className="space-y-2">
                {activeSubject.units.map((unit, idx) => {
                  const unitNotesCount = notes.filter(
                    (n) => n.subjectId === activeSubject.id && n.unit === unit
                  ).length

                  return (
                    <div
                      key={idx}
                      className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-semibold text-slate-200">{unit}</span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        {unitNotesCount} {unitNotesCount === 1 ? 'apunte' : 'apuntes'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <NewSubjectModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={(data) => {
          updateSubject(activeSubject.id, data)
        }}
        editingSubject={activeSubject}
        currentSemester={activeSubject.semester}
      />
    </div>
  )
}
