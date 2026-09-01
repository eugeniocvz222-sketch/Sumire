import React, { useEffect, useState } from 'react'
import { Search, X, BookOpen, FileText, ChevronRight, Star } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { IconRenderer } from '../common/IconRenderer'
import { COLOR_SCHEMES } from '../common/ColorMap'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const {
    notes,
    subjects,
    setActiveSubjectId,
    setActiveNoteId,
    setActiveView,
    setActivePeriodId,
    setSelectedSemester,
  } = useApp()
  const [query, setQuery] = useState('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) {
          onClose()
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const userSubjectIds = new Set(
    subjects.filter((s) => !['sub-1', 'sub-2', 'sub-3', 'sub-4'].includes(s.id)).map((s) => s.id)
  )
  const userNotes = notes.filter(
    (n) => userSubjectIds.has(n.subjectId) && !['note-1', 'note-2', 'note-3'].includes(n.id)
  )
  const trimmed = query.trim().toLowerCase()

  const matchingNotes = userNotes.filter((n) => {
    if (!trimmed) return true
    const titleMatch = n.title.toLowerCase().includes(trimmed)
    const tagMatch = (n.tags || []).some((t) => t.toLowerCase().includes(trimmed))
    const unitMatch = (n.unit || '').toLowerCase().includes(trimmed)
    const contentMatch = (n.content || '').toLowerCase().includes(trimmed)
    return titleMatch || tagMatch || unitMatch || contentMatch
  })

  const handleSelectNote = (subjectId: string, noteId: string) => {
    const targetSubject = subjects.find((s) => s.id === subjectId)
    if (targetSubject) {
      if (targetSubject.periodId) {
        setActivePeriodId(targetSubject.periodId)
        setSelectedSemester(targetSubject.semester)
      }
      setActiveSubjectId(subjectId)
      setActiveNoteId(noteId)
      setActiveView('subject')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 backdrop-blur-xs p-4 pt-20">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Buscar apuntes, materias, fórmulas, conceptos..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-white text-sm placeholder-slate-500 focus:outline-hidden"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700 rounded-md">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="p-2 overflow-y-auto flex-1 space-y-1">
          {matchingNotes.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              No se encontraron apuntes con el término &ldquo;{query}&rdquo;
            </div>
          ) : (
            matchingNotes.map((note) => {
              const subject = subjects.find((s) => s.id === note.subjectId)
              const scheme = subject ? COLOR_SCHEMES[subject.color] : COLOR_SCHEMES.slate

              return (
                <button
                  key={note.id}
                  onClick={() => handleSelectNote(note.subjectId, note.id)}
                  className="w-full text-left p-3 rounded-xl hover:bg-slate-800/80 transition flex items-center justify-between group border border-transparent hover:border-slate-700/50"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        scheme ? `${scheme.badgeBg} ${scheme.accentColor}` : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <IconRenderer icon={subject?.icon || 'book-open'} className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm truncate group-hover:text-indigo-300 transition">
                          {note.title}
                        </span>
                        {note.isFavorite && <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 truncate">
                        <span>{subject?.name || 'Materia'}</span>
                        <span>•</span>
                        <span>{note.unit}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition shrink-0 ml-2" />
                </button>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
