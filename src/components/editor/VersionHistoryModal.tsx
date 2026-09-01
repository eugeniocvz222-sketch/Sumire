import React, { useState } from 'react'
import {
  History,
  RotateCcw,
  Clock,
  Save,
  Check,
  X,
  Eye,
  FileText,
  Plus,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'
import { Note, NoteVersion } from '../../types'
import { alerts } from '../../lib/alerts'

interface VersionHistoryModalProps {
  note: Note
  onRestoreVersion: (version: NoteVersion) => void
  onCreateManualSnapshot: (label?: string) => void
  onClose: () => void
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  note,
  onRestoreVersion,
  onCreateManualSnapshot,
  onClose,
}) => {
  const versions = note.versions || []
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(
    versions.length > 0 ? versions[0].id : null
  )
  const [manualLabelInput, setManualLabelInput] = useState('')
  const [isCreatingManual, setIsCreatingManual] = useState(false)

  const selectedVersion = versions.find((v) => v.id === selectedVersionId) || versions[0]

  const handleCreateSnapshot = () => {
    onCreateManualSnapshot(manualLabelInput.trim() || 'Punto de guardado manual')
    setManualLabelInput('')
    setIsCreatingManual(false)
  }

  const handleRestore = async (v: NoteVersion) => {
    const confirmed = await alerts.confirm({
      title: '¿Restaurar esta versión?',
      text: `Se restaurará el apunte al estado del ${new Date(v.createdAt).toLocaleString()}. Tu versión actual se guardará como copia de seguridad previa.`,
      confirmButtonText: 'Sí, restaurar versión',
      cancelButtonText: 'Cancelar',
      icon: 'question',
    })

    if (confirmed) {
      onRestoreVersion(v)
      alerts.success('Versión restaurada con éxito', 'Tu apunte volvió al estado seleccionado')
      onClose()
    }
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleString('es-MX', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#0c0c16] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-black/40 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-950/40">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Historial de Versiones</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20">
                  {versions.length} {versions.length === 1 ? 'versión' : 'versiones'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Revisa y restaura versiones anteriores de <strong className="text-indigo-300 font-semibold">"{note.title}"</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isCreatingManual && (
              <button
                type="button"
                onClick={() => setIsCreatingManual(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold border border-indigo-500/30 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Crear Punto de Control</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Manual Checkpoint Form */}
        {isCreatingManual && (
          <div className="px-5 py-3 bg-indigo-950/40 border-b border-indigo-500/20 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Save className="w-4 h-4 text-indigo-400 shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Nombre del punto de guardado (ej. Antes del repaso, Versión limpia...)"
                value={manualLabelInput}
                onChange={(e) => setManualLabelInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateSnapshot()
                  if (e.key === 'Escape') setIsCreatingManual(false)
                }}
                className="w-full px-3 py-1.5 bg-slate-900 border border-indigo-500/40 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreatingManual(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCreateSnapshot}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Guardar Punto
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area (Two Columns: Timeline + Preview) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Column: Version Timeline List (4 cols) */}
          <div className="md:col-span-4 border-r border-white/5 overflow-y-auto p-3 space-y-2 bg-[#080812]">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 pt-1 pb-1 flex items-center justify-between">
              <span>Línea de Tiempo</span>
              <span>Guardados</span>
            </div>

            {versions.length === 0 ? (
              <div className="p-6 text-center text-slate-500 space-y-2">
                <Clock className="w-8 h-8 mx-auto opacity-40 text-slate-600" />
                <p className="text-xs">No hay versiones anteriores guardadas todavía.</p>
                <button
                  onClick={() => onCreateManualSnapshot('Primer punto de control')}
                  className="px-3 py-1.5 bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-semibold transition cursor-pointer inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> Crear primera versión
                </button>
              </div>
            ) : (
              versions.map((v, index) => {
                const isSelected = v.id === selectedVersion?.id
                const isLatest = index === 0

                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVersionId(v.id)}
                    className={`w-full text-left p-3 rounded-2xl border transition cursor-pointer flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500/50 shadow-md ring-1 ring-indigo-500/30'
                        : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isLatest ? 'bg-emerald-400 ring-2 ring-emerald-400/20' : 'bg-indigo-400'
                          }`}
                        />
                        <span className="truncate">{v.label || (isLatest ? 'Última versión' : 'Auto-guardado')}</span>
                      </span>
                      {isLatest && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold uppercase shrink-0">
                          Actual
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {formatTime(v.createdAt)}
                      </span>
                      <span className="font-mono text-slate-500">
                        {v.wordCount} palabras
                      </span>
                    </div>
                  </button>
                )
              })
            )}
          </div>

          {/* Right Column: Version Preview & Diff Inspector (8 cols) */}
          <div className="md:col-span-8 flex flex-col bg-[#0c0c16] overflow-hidden">
            {selectedVersion ? (
              <>
                {/* Preview Header */}
                <div className="p-4 border-b border-white/5 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span>{selectedVersion.title || 'Sin título'}</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-3 mt-0.5">
                      <span>{formatTime(selectedVersion.createdAt)}</span>
                      <span>•</span>
                      <span>{selectedVersion.wordCount} palabras</span>
                      <span>•</span>
                      <span>{selectedVersion.characterCount} caracteres</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRestore(selectedVersion)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-950/50 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restaurar esta Versión
                  </button>
                </div>

                {/* Preview Body */}
                <div className="p-6 overflow-y-auto flex-1 text-slate-200 text-sm leading-relaxed prose prose-invert max-w-none">
                  <div
                    dangerouslySetInnerHTML={{ __html: selectedVersion.content || '<p class="italic text-slate-500">Sin contenido guardado en esta versión.</p>' }}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <History className="w-12 h-12 mb-2 opacity-30" />
                <p className="text-sm">Selecciona una versión a la izquierda para inspeccionar su contenido.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 bg-black/40 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Las versiones se respaldan automáticamente de forma local para evitar pérdidas accidentales.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
