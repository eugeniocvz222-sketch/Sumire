import React, { useEffect, useState, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Minus,
  Undo,
  Redo,
  Download,
  Trash2,
  Star,
  Tag,
  Check,
  Plus,
  X,
  FileCode,
  History,
  Sparkles,
  Bot,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { COLOR_SCHEMES } from '../common/ColorMap'
import { alerts } from '../../lib/alerts'
import { ShimmerButton } from '../reactbits/ShimmerButton'
import { VersionHistoryModal } from './VersionHistoryModal'
import { NoteVersion } from '../../types'
import { AIService } from '../../lib/aiService'
import { MarkdownView } from '../common/MarkdownView'

export const NoteEditor: React.FC = () => {
  const {
    activeNote,
    activeSubject,
    settings,
    createNote,
    updateNote,
    deleteNote,
    toggleFavoriteNote,
    exportNoteMarkdown,
    saveNoteVersion,
    restoreNoteVersion,
    setActiveNoteId,
  } = useApp()

  const [title, setTitle] = useState(activeNote?.title || '')
  const [unit, setUnit] = useState(activeNote?.unit || '')
  const [tags, setTags] = useState<string[]>(activeNote?.tags || [])
  const [newTagInput, setNewTagInput] = useState('')
  const [isAddingTag, setIsAddingTag] = useState(false)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved')
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [, setSelectionTick] = useState(0)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: 'Empieza a escribir tus notas de clase... (puedes usar Markdown, listas de tareas, código...)',
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: activeNote?.content || '',
    onSelectionUpdate: () => {
      setSelectionTick((t) => t + 1)
    },
    onTransaction: () => {
      setSelectionTick((t) => t + 1)
    },
    onUpdate: ({ editor }) => {
      setSaveStatus('saving')
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)

      saveTimeoutRef.current = setTimeout(() => {
        if (activeNote) {
          updateNote(activeNote.id, {
            content: editor.getHTML(),
          })
          setSaveStatus('saved')
        }
      }, 400)
    },
  })

  // Sync state when active note changes
  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title)
      setUnit(activeNote.unit)
      setTags(activeNote.tags || [])

      if (editor && editor.getHTML() !== activeNote.content) {
        editor.commands.setContent(activeNote.content || '')
      }
    }
  }, [activeNote?.id])

  if (!activeNote || !activeSubject) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#06060e] relative">
        <div className="w-16 h-16 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center mb-4 text-purple-400 shadow-xl shadow-purple-950/40">
          <FileCode className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-1.5">Libreta lista para apuntes</h3>
        <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
          Crea una nueva nota de clase con formato enriquecido, código y Markdown para <strong className="text-purple-300">{activeSubject?.name || 'esta materia'}</strong>.
        </p>
        {activeSubject && (
          <ShimmerButton
            onClick={() => createNote(activeSubject.id, activeSubject.units?.[0] || 'Unidad 1')}
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
          >
            Crear Primer Apunte
          </ShimmerButton>
        )}
      </div>
    )
  }

  const activeScheme = (activeSubject?.color && COLOR_SCHEMES[activeSubject.color]) || COLOR_SCHEMES.emerald

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    updateNote(activeNote.id, { title: newTitle })
  }

  const handleUnitChange = (newUnit: string) => {
    setUnit(newUnit)
    updateNote(activeNote.id, { unit: newUnit })
  }

  const handleAddTag = () => {
    if (newTagInput.trim() && !tags.includes(newTagInput.trim().toLowerCase())) {
      const updatedTags = [...tags, newTagInput.trim().toLowerCase()]
      setTags(updatedTags)
      updateNote(activeNote.id, { tags: updatedTags })
      setNewTagInput('')
      setIsAddingTag(false)
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((t) => t !== tagToRemove)
    setTags(updatedTags)
    updateNote(activeNote.id, { tags: updatedTags })
  }

  const handleExport = async () => {
    const success = await exportNoteMarkdown(activeNote.id)
    if (success) {
      alerts.success('Apunte exportado', `Se guardó "${activeNote.title}.md"`)
    }
  }

  const handleGenerateAISummary = async () => {
    if (!activeNote) return
    const aiConfig = settings.aiConfig || { provider: 'gemini' }

    if (
      aiConfig.provider === 'off' ||
      (aiConfig.provider === 'gemini' && !aiConfig.geminiApiKey?.trim()) ||
      (aiConfig.provider === 'openai' && !aiConfig.openaiApiKey?.trim())
    ) {
      alerts.info(
        'Configura tu Proveedor de IA',
        'Ve a Ajustes (⚙️) y selecciona tu proveedor (Google Gemini, OpenAI u Ollama local) para generar resúmenes automáticos.'
      )
      return
    }

    setIsGeneratingSummary(true)
    alerts.info('Analizando apunte...', 'Sumire AI está extrayendo los conceptos clave.')

    try {
      const summaryText = await AIService.generateSummary(
        activeNote.content,
        activeNote.title,
        aiConfig
      )
      updateNote(activeNote.id, { summary: summaryText })
      alerts.success('Resumen generado con éxito', 'Se guardó en tu apunte.')
    } catch (err: any) {
      alerts.error('Error al generar resumen', err.message || 'No se pudo conectar con el modelo de IA.')
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = await alerts.confirm({
      title: `¿Eliminar "${activeNote.title}"?`,
      text: 'Este apunte se eliminará permanentemente de tu libreta.',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      isDanger: true,
      icon: 'warning',
    })

    if (confirmed) {
      deleteNote(activeNote.id)
      setActiveNoteId(null)
      alerts.success('Apunte eliminado')
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#030306]/90 overflow-hidden">
      {/* Top Note Bar */}
      <div className="p-4 border-b border-white/5 bg-[#06060c] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Unit Selector Dropdown */}
          <select
            value={unit}
            onChange={(e) => handleUnitChange(e.target.value)}
            className="px-3 py-1.5 bg-[#0c0c16] border border-white/10 rounded-lg text-xs text-slate-300 font-medium focus:outline-hidden focus:border-purple-500"
          >
            {(activeSubject.units || ['General']).map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>

          {/* Tags Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-md text-[11px] text-slate-400"
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="text-slate-500 hover:text-rose-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {isAddingTag ? (
              <div className="inline-flex items-center gap-1">
                <input
                  type="text"
                  autoFocus
                  placeholder="Etiqueta..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddTag()
                    if (e.key === 'Escape') setIsAddingTag(false)
                  }}
                  className="px-2 py-0.5 bg-slate-900 border border-indigo-500 rounded-md text-xs text-white placeholder-slate-600 focus:outline-hidden w-20"
                />
                <button
                  onClick={handleAddTag}
                  className="p-1 text-emerald-400 hover:bg-slate-900 rounded"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingTag(true)}
                className="inline-flex items-center gap-1 px-2 py-1 bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 rounded-md text-[11px] text-slate-400 hover:text-slate-200 transition"
              >
                <Tag className="w-3 h-3" />
                <Plus className="w-2.5 h-2.5" />
              </button>
            )}
          </div>
        </div>

        {/* Note Action Buttons */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[11px] text-slate-500 hidden sm:inline flex items-center gap-1">
            {saveStatus === 'saving' ? (
              <span className="text-amber-400 animate-pulse">Guardando...</span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Guardado local
              </span>
            )}
          </span>

          {/* Version History Button */}
          <button
            type="button"
            onClick={() => {
              if (activeNote) {
                saveNoteVersion(activeNote.id, 'Punto actual')
              }
              setIsHistoryOpen(true)
            }}
            title="Historial de versiones y puntos de restauración"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/25 transition text-xs font-semibold cursor-pointer shadow-sm"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Versiones</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500/30 text-indigo-200 font-mono">
              {activeNote.versions?.length || 0}
            </span>
          </button>

          {/* AI Summary Button */}
          <button
            type="button"
            onClick={handleGenerateAISummary}
            disabled={isGeneratingSummary}
            title="Generar Resumen Inteligente con IA (Gemini / OpenAI / Ollama)"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600/25 via-indigo-600/25 to-purple-600/25 hover:from-purple-600/40 hover:to-indigo-600/40 text-purple-200 border border-purple-500/40 transition text-xs font-semibold cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-purple-400 ${isGeneratingSummary ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">
              {isGeneratingSummary ? 'Resumiendo...' : 'Resumen IA'}
            </span>
          </button>

          <button
            onClick={() => toggleFavoriteNote(activeNote.id)}
            title={activeNote.isFavorite ? 'Quitar de Favoritos' : 'Marcar Favorito'}
            className={`p-2 rounded-lg transition ${
              activeNote.isFavorite
                ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                : 'text-slate-400 hover:text-amber-300 hover:bg-slate-900'
            }`}
          >
            <Star className={`w-4 h-4 ${activeNote.isFavorite ? 'fill-amber-400' : ''}`} />
          </button>

          <button
            onClick={handleExport}
            title="Exportar a archivo Markdown (.md)"
            className="p-2 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-900 transition border border-transparent hover:border-slate-800"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleDelete}
            title="Eliminar este apunte"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition border border-transparent hover:border-rose-500/20"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Note Title Input */}
      <div className="px-8 pt-6 pb-2 shrink-0">
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Título del apunte..."
          className="w-full text-2xl md:text-3xl font-bold text-white bg-transparent focus:outline-hidden placeholder-slate-600 border-b border-transparent focus:border-slate-800 pb-2 transition"
        />
        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2">
          <span>{activeSubject.name}</span>
          <span>•</span>
          <span>Creado el {new Date(activeNote.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* AI Summary Card (If generated) */}
      {activeNote.summary && (
        <div className="mx-8 my-2 p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 backdrop-blur-md relative group animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Resumen Inteligente (Sumire AI)
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGenerateAISummary}
                className="text-[11px] text-purple-400 hover:text-purple-200 transition font-medium cursor-pointer"
              >
                Regenerar
              </button>
              <button
                type="button"
                onClick={() => updateNote(activeNote.id, { summary: undefined })}
                className="text-[11px] text-slate-500 hover:text-rose-400 transition cursor-pointer"
              >
                Ocultar
              </button>
            </div>
          </div>
          <div className="pt-2 border-t border-purple-500/15">
            <MarkdownView content={activeNote.summary} />
          </div>
        </div>
      )}

      {/* Editor Formatting Toolbar */}
      {editor && (
        <div className="mx-8 my-2 px-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center gap-1 overflow-x-auto shrink-0 shadow-sm">
          {/* Headings */}
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1.5 rounded-lg text-xs font-bold transition ${
              editor.isActive('heading', { level: 1 })
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Título 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded-lg text-xs font-bold transition ${
              editor.isActive('heading', { level: 2 })
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Título 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded-lg text-xs font-bold transition ${
              editor.isActive('heading', { level: 3 })
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Título 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-slate-800 mx-1" />

          {/* Basic Formatting */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive('bold')
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Negrita (Ctrl+B)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive('italic')
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Cursiva (Ctrl+I)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive('strike')
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Tachado"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-slate-800 mx-1" />

          {/* Lists & Tasks */}
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive('bulletList')
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Lista con viñetas"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive('orderedList')
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Lista numerada"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive('taskList')
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Lista de verificación (To-Do)"
          >
            <CheckSquare className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-slate-800 mx-1" />

          {/* Code & Quote */}
          <button
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive('codeBlock')
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Bloque de código"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded-lg transition ${
              editor.isActive('blockquote')
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Cita / Nota importante"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Línea divisoria"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="w-px h-4 bg-slate-800 mx-1" />

          {/* Undo / Redo */}
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-30"
            title="Deshacer (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-30"
            title="Rehacer (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto px-8 py-4">
        <div className="max-w-4xl mx-auto pb-32">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Version History Modal */}
      {isHistoryOpen && activeNote && (
        <VersionHistoryModal
          note={activeNote}
          onCreateManualSnapshot={(label) => {
            saveNoteVersion(activeNote.id, label)
          }}
          onRestoreVersion={(version) => {
            restoreNoteVersion(activeNote.id, version.id)
            setTitle(version.title)
            editor?.commands.setContent(version.content || '')
          }}
          onClose={() => setIsHistoryOpen(false)}
        />
      )}
    </div>
  )
}
