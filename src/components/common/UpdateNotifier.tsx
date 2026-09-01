import React, { useEffect, useState } from 'react'
import { Sparkles, Download, RefreshCw, X, ArrowRight } from 'lucide-react'

export const UpdateNotifier: React.FC = () => {
  const [updateState, setUpdateState] = useState<{
    status: 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'error'
    version?: string
    percent?: number
  }>({ status: 'idle' })

  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !(window as any).electronAPI?.onUpdateStatus) {
      return
    }

    const unsubscribe = (window as any).electronAPI.onUpdateStatus((data: any) => {
      if (data.status === 'available') {
        setUpdateState({
          status: 'available',
          version: data.info?.version,
        })
        setDismissed(false)
      } else if (data.status === 'downloading') {
        setUpdateState((prev) => ({
          status: 'downloading',
          percent: data.percent,
          version: prev.version,
        }))
        setDismissed(false)
      } else if (data.status === 'downloaded') {
        setUpdateState({
          status: 'downloaded',
          version: data.info?.version,
        })
        setDismissed(false)
      }
    })

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [])

  if (dismissed || updateState.status === 'idle' || updateState.status === 'checking') {
    return null
  }

  const handleRestart = () => {
    if ((window as any).electronAPI?.restartAndInstall) {
      ;(window as any).electronAPI.restartAndInstall()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[999] max-w-sm animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="p-4 rounded-2xl bg-[#0e0e1a]/95 border border-purple-500/40 shadow-2xl shadow-purple-950/60 backdrop-blur-xl flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0">
              {updateState.status === 'downloaded' ? (
                <Sparkles className="w-4 h-4 text-emerald-400 animate-bounce" />
              ) : (
                <Download className="w-4 h-4 text-purple-400 animate-pulse" />
              )}
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">
                {updateState.status === 'downloaded'
                  ? `¡Actualización v${updateState.version || ''} lista!`
                  : `Descargando mejoras...`}
              </h4>
              <p className="text-[11px] text-slate-400">
                {updateState.status === 'downloaded'
                  ? 'Reinicia para aplicar la nueva versión de Sumire.'
                  : `Progreso: ${updateState.percent || 0}%`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress bar if downloading */}
        {updateState.status === 'downloading' && (
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-300"
              style={{ width: `${updateState.percent || 0}%` }}
            />
          </div>
        )}

        {/* Action Button */}
        {updateState.status === 'downloaded' && (
          <button
            onClick={handleRestart}
            className="w-full py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-purple-950/50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reiniciar y Actualizar
          </button>
        )}
      </div>
    </div>
  )
}
