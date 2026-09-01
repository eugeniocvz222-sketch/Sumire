import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import {
  CheckCircle2,
  Plus,
  Calendar,
  AlertCircle,
  Clock,
  Trash2,
  Filter,
  CheckCircle,
  Layers,
} from 'lucide-react'
import { PriorityLevel, TaskType } from '../../types'
import { COLOR_SCHEMES } from '../common/ColorMap'
import { MinimalBackground } from '../reactbits/MinimalBackground'
import { ShimmerButton } from '../reactbits/ShimmerButton'

export const TasksView: React.FC = () => {
  const { tasks, subjects, createTask, toggleTask, deleteTask } = useApp()
  const [filterType, setFilterType] = useState<string>('pending')
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '')
  const [type, setType] = useState<TaskType>('task')
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0])
  const [priority, setPriority] = useState<PriorityLevel>('medium')

  const filteredTasks = tasks.filter((t) => {
    const matchesStatus =
      filterType === 'all'
        ? true
        : filterType === 'pending'
        ? !t.isCompleted
        : t.isCompleted
    const matchesSubject = selectedSubjectId === 'all' || t.subjectId === selectedSubjectId
    return matchesStatus && matchesSubject
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !subjectId) return

    createTask({
      title: title.trim(),
      subjectId,
      type,
      dueDate,
      priority,
    })

    setTitle('')
    setIsModalOpen(false)
  }

  return (
    <div className="relative flex-1 overflow-y-auto p-6 md:p-8 bg-[#030306]">
      <MinimalBackground />
      <div className="relative z-10 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-white">Tareas, Proyectos y Exámenes</h1>
            <p className="text-xs text-slate-400">
              Mantén el control de tus entregas y exámenes de todas tus materias
            </p>
          </div>

          <ShimmerButton
            onClick={() => {
              if (subjects.length > 0) {
                setSubjectId(subjects[0].id)
                setIsModalOpen(true)
              } else {
                alert('Primero crea una materia para poder asignarle tareas.')
              }
            }}
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
          >
            Nueva Entrega
          </ShimmerButton>
        </div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setFilterType('pending')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                filterType === 'pending'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Pendientes ({tasks.filter((t) => !t.isCompleted).length})
            </button>
            <button
              onClick={() => setFilterType('completed')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                filterType === 'completed'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Completadas ({tasks.filter((t) => t.isCompleted).length})
            </button>
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                filterType === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Todas ({tasks.length})
            </button>
          </div>

          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-medium focus:outline-hidden"
          >
            <option value="all">Todas las materias</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>

        {/* Task List */}
        <div className="space-y-2.5">
          {filteredTasks.length === 0 ? (
            <div className="py-20 text-center text-slate-500 bg-slate-900/40 rounded-2xl border border-slate-800">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 text-emerald-400 opacity-50" />
              <h3 className="text-base font-bold text-white mb-1">¡No hay pendientes en esta vista!</h3>
              <p className="text-xs text-slate-400">
                Todo tu trabajo universitario está organizado y al día.
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => {
              const subject = subjects.find((s) => s.id === task.subjectId)
              const scheme = subject ? COLOR_SCHEMES[subject.color] : COLOR_SCHEMES.slate

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                    task.isCompleted
                      ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition shrink-0 ${
                        task.isCompleted
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-700 hover:border-indigo-500 bg-slate-950'
                      }`}
                    >
                      {task.isCompleted && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold truncate ${
                            task.isCompleted ? 'line-through text-slate-500' : 'text-white'
                          }`}
                        >
                          {task.title}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                        {subject && (
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${scheme.badgeBg} ${scheme.badgeText}`}
                          >
                            {subject.code} • {subject.name}
                          </span>
                        )}
                        <span>•</span>
                        <span className="capitalize text-slate-300 font-medium">
                          {task.type === 'exam' ? 'Examen' : task.type === 'project' ? 'Proyecto' : task.type === 'quiz' ? 'Quiz' : 'Tarea'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="w-3 h-3 text-purple-400" /> {task.dueDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition shrink-0"
                    title="Eliminar tarea"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Nueva Tarea / Examen</h3>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Materia *</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-hidden"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Título de la actividad *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Examen Parcial 2, Entrega de Proyecto..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tipo de Actividad</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as TaskType)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-hidden"
                  >
                    <option value="task">Tarea Normal</option>
                    <option value="exam">Examen Parcial / Final</option>
                    <option value="project">Proyecto / Práctica</option>
                    <option value="quiz">Quiz Rápido</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Fecha de Entrega</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <ShimmerButton
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </ShimmerButton>
                <ShimmerButton
                  type="submit"
                  variant="primary"
                  size="sm"
                >
                  Crear Actividad
                </ShimmerButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
