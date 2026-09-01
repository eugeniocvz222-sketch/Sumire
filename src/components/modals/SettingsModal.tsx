import React, { useState, useEffect } from 'react'
import {
  X,
  Folder,
  RefreshCw,
  Download,
  Upload,
  Cloud,
  HardDrive,
  Check,
  Palette,
  Sparkles,
  Terminal,
  Copy,
  Trash2,
  AlertTriangle,
  FileCode,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { SYSTEM_THEMES, SystemTheme } from '../common/ThemeConfig'
import { ShimmerButton } from '../reactbits/ShimmerButton'
import { alerts } from '../../lib/alerts'
import { logger, LogEntry, LogLevel } from '../../lib/logger'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenOnboarding?: () => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onOpenOnboarding }) => {
  const {
    settings,
    updateSettings,
    chooseCustomFolder,
    exportData,
    importData,
    triggerCloudSync,
    isSyncing,
    syncMessage,
    systemTheme,
    setSystemTheme,
  } = useApp()

  const [activeTab, setActiveTab] = useState<'general' | 'logs'>('general')
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl || '')
  const [supabaseKey, setSupabaseKey] = useState(settings.supabaseAnonKey || '')
  const [userEmail, setUserEmail] = useState(settings.userEmail || '')
  const [importStatus, setImportStatus] = useState<string | null>(null)

  // Logs state
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [logFilter, setLogFilter] = useState<'ALL' | LogLevel>('ALL')
  const [copiedLogs, setCopiedLogs] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const unsubscribe = logger.subscribe((updatedLogs) => {
      setLogs(updatedLogs)
    })
    return () => unsubscribe()
  }, [isOpen])

  if (!isOpen) return null

  const handleSelectTheme = (themeId: SystemTheme) => {
    setSystemTheme(themeId)
    alerts.success('Tema aplicado', `Se activó el tema ${SYSTEM_THEMES[themeId].name}`)
  }

  const handleSaveFolder = async () => {
    await chooseCustomFolder()
  }

  const handleSaveCloudSettings = () => {
    updateSettings({
      supabaseUrl,
      supabaseAnonKey: supabaseKey,
      userEmail,
      cloudSyncEnabled: !!(supabaseUrl && supabaseKey),
    })
    alerts.success('Ajustes guardados', 'Configuración de sincronización actualizada')
  }

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImportStatus('Importando copia de seguridad...')
      const success = await importData(file)
      if (success) {
        setImportStatus('Datos importados exitosamente')
      } else {
        setImportStatus('Error al importar archivo. Formato inválido.')
      }
      setTimeout(() => setImportStatus(null), 3500)
    }
  }

  const handleCopyAllLogs = () => {
    const reportStr = logger.exportReport()
    navigator.clipboard.writeText(reportStr)
    setCopiedLogs(true)
    alerts.success('Logs copiados', 'Reporte completo copiado al portapapeles')
    setTimeout(() => setCopiedLogs(false), 2000)
  }

  const handleDownloadLogs = () => {
    const reportStr = logger.exportReport()
    const blob = new Blob([reportStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `apuntes-sistema-logs-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    alerts.success('Reporte descargado', 'Archivo JSON generado con éxito')
  }

  const handleClearLogs = () => {
    logger.clearLogs()
    alerts.info('Registro limpiado', 'Se han borrado los logs del sistema')
  }

  const filteredLogs = logs.filter((log) => {
    if (logFilter === 'ALL') return true
    return log.level === logFilter
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0c0c16] border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-8 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/5 bg-[#06060c] flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden shadow-md shadow-purple-600/30 ring-2 ring-purple-500/40 shrink-0 bg-[#05050a]">
              <img src="/apuntes_mascot.png" alt="Apuntes Mascot" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Configuración del Sistema</h2>
              <p className="text-xs text-slate-400">
                Personaliza el tema visual, almacenamiento y registros de diagnóstico
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 pb-0 bg-[#06060c] border-b border-white/5 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all ${
              activeTab === 'general'
                ? 'bg-[#0c0c16] text-purple-300 border-t border-x border-white/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            General & Temas
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 text-xs font-semibold rounded-t-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'bg-[#0c0c16] text-purple-300 border-t border-x border-white/10'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Diagnóstico & Logs</span>
            {logs.filter((l) => l.level === 'ERROR').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-sm">
          {activeTab === 'general' && (
            <>
              {/* Section 1: Themes & Visual Styles */}
              <div className="bg-[#06060c] p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-white font-bold">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Temas de Color y Estilo Visual</span>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-semibold">
                    6 Estilos Neón
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Selecciona el ambiente de color para tu espacio de estudio. La atmósfera y resplandores del fondo cambiarán inmediatamente:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                  {(Object.keys(SYSTEM_THEMES) as SystemTheme[]).map((themeKey) => {
                    const item = SYSTEM_THEMES[themeKey]
                    const isSelected = systemTheme === themeKey

                    return (
                      <button
                        key={themeKey}
                        type="button"
                        onClick={() => handleSelectTheme(themeKey)}
                        className={`relative p-3.5 rounded-2xl border text-left transition-all duration-300 flex flex-col justify-between cursor-pointer select-none overflow-hidden ${
                          isSelected
                            ? `bg-white/[0.06] ${item.borderColor} ring-2 ring-purple-500/50 shadow-lg`
                            : 'bg-[#0c0c16] border-white/5 hover:border-white/20 hover:bg-white/[0.02]'
                        }`}
                      >
                        {/* Visual Color Swatch */}
                        <div className="flex items-center justify-between mb-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl bg-linear-to-tr ${item.swatchGradient} shadow-md flex items-center justify-center text-white`}
                          >
                            {isSelected && <Check className="w-4 h-4" />}
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${item.badgeBg} ${item.badgeText}`}
                          >
                            {item.name.split(' ')[0]}
                          </span>
                        </div>

                        <div>
                          <div className="text-xs font-bold text-white leading-snug">{item.name}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                            {item.subtitle}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Section 2: Local Storage (OneDrive / Local Disk) */}
              <div className="bg-[#06060c] p-5 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-white font-bold">
                    <HardDrive className="w-4 h-4 text-emerald-400" />
                    <span>Carpeta de Almacenamiento Local</span>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-semibold">
                    100% Offline
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Guarda tus notas en una carpeta local de tu laptop. Si seleccionas una carpeta dentro de tu <strong>OneDrive</strong> o <strong>Google Drive</strong>, se sincronizará automáticamente con tu PC.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={settings.storagePath || 'PostgreSQL Local (DB: apuntes)'}
                    className="flex-1 px-3.5 py-2 bg-[#0c0c16] border border-white/10 rounded-xl text-slate-300 text-xs font-mono select-all"
                  />
                  <ShimmerButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleSaveFolder}
                    icon={<Folder className="w-4 h-4" />}
                  >
                    Seleccionar Carpeta
                  </ShimmerButton>
                </div>
              </div>

              {/* Section 3: Cloud Sync */}
              <div className="bg-[#06060c] p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-white font-bold">
                    <Cloud className="w-4 h-4 text-blue-400" />
                    <span>Sincronización en la Nube (Supabase)</span>
                  </div>
                  <button
                    type="button"
                    onClick={triggerCloudSync}
                    disabled={isSyncing}
                    className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-400 rounded-lg flex items-center gap-1.5 text-xs font-medium transition cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Sincronizando...' : 'Sincronizar Ahora'}
                  </button>
                </div>
                <p className="text-xs text-slate-400">
                  Conecta una base de datos gratuita de Supabase para tener sincronización bidireccional remota.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Supabase Project URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://xyzcompany.supabase.co"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0c0c16] border border-white/10 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Supabase Anon Key
                    </label>
                    <input
                      type="password"
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                      value={supabaseKey}
                      onChange={(e) => setSupabaseKey(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0c0c16] border border-white/10 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Estado: {syncMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveCloudSettings}
                    className="px-4 py-1.5 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    Guardar Conexión Cloud
                  </button>
                </div>
              </div>

              {/* Section 4: Backup & Restore */}
              <div className="bg-[#06060c] p-5 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center gap-2.5 text-white font-bold">
                  <Download className="w-4 h-4 text-purple-400" />
                  <span>Copias de Seguridad (Backup)</span>
                </div>
                <p className="text-xs text-slate-400">
                  Exporta todas tus materias, apuntes y tareas a un archivo JSON o restaura un respaldo previo.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <ShimmerButton
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={exportData}
                    icon={<Download className="w-4 h-4 text-purple-400" />}
                  >
                    Exportar Backup JSON
                  </ShimmerButton>

                  <label className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-xl flex items-center gap-2 text-xs font-semibold cursor-pointer transition">
                    <Upload className="w-4 h-4 text-emerald-400" /> Importar Backup
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                  </label>

                  {importStatus && (
                    <div className="text-xs text-purple-400 flex items-center gap-1 font-medium">
                      <Check className="w-3.5 h-3.5" /> {importStatus}
                    </div>
                  )}
                </div>
              </div>

              {/* Section 5: Auto-Updates & Software Version */}
              <div className="bg-[#06060c] p-5 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-white font-bold">
                    <RefreshCw className="w-4 h-4 text-indigo-400" />
                    <span>Actualizaciones del Sistema</span>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono font-bold">
                    v1.0.0
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sumire busca mejoras automáticamente al iniciar conectándose con GitHub. También puedes buscar manualmente:
                </p>
                <div>
                  <button
                    type="button"
                    onClick={async () => {
                      if ((window as any).electronAPI?.checkForUpdates) {
                        alerts.info('Buscando actualizaciones...', 'Conectando con GitHub')
                        const res = await (window as any).electronAPI.checkForUpdates()
                        if (res && !res.success && res.message) {
                          alerts.info('Modo Desarrollo', res.message)
                        }
                      } else {
                        alerts.success('Versión al día', 'Estás ejecutando la versión v1.0.0 de Sumire.')
                      }
                    }}
                    className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 text-indigo-300 hover:text-white rounded-xl text-xs font-semibold transition cursor-pointer inline-flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Buscar Actualizaciones Ahora
                  </button>
                </div>
              </div>

              {/* Section 6: Onboarding Walkthrough & Shortcuts Guide */}
              {onOpenOnboarding && (
                <div className="bg-[#06060c] p-5 rounded-2xl border border-purple-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-white font-bold">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>Guía Interactiva & Atajos de Sumire</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-semibold">
                      Tutorial
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Vuelve a ver el tutorial interactivo con el recorrido por cada botón, módulo y atajo de teclado del sistema.
                  </p>
                  <div>
                    <ShimmerButton
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        onClose()
                        onOpenOnboarding()
                      }}
                      icon={<Sparkles className="w-4 h-4" />}
                    >
                      Abrir Guía de Bienvenida
                    </ShimmerButton>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Tab 2: Logs & System Diagnostics */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#06060c] p-4 rounded-2xl border border-white/5">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-purple-400" />
                    <span>Registro Exacto de Errores y Eventos</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Historial en tiempo real de operaciones de base de datos, advertencias y errores.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyAllLogs}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-slate-300 flex items-center gap-1.5 transition"
                  >
                    {copiedLogs ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLogs ? 'Copiado' : 'Copiar'}</span>
                  </button>

                  <button
                    onClick={handleDownloadLogs}
                    className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-slate-300 flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar JSON</span>
                  </button>

                  <button
                    onClick={handleClearLogs}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-white/5 rounded-lg transition"
                    title="Limpiar registros"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                {(['ALL', 'ERROR', 'WARN', 'DB', 'INFO'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setLogFilter(filter)}
                    className={`px-3 py-1 rounded-lg font-medium transition ${
                      logFilter === filter
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {filter === 'ALL' ? `Todos (${logs.length})` : `${filter} (${logs.filter((l) => l.level === filter).length})`}
                  </button>
                ))}
              </div>

              {/* Log Stream Terminal Container */}
              <div className="h-80 overflow-y-auto bg-black/80 p-3.5 rounded-2xl border border-white/10 font-mono text-[11px] space-y-2">
                {filteredLogs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500">
                    <Check className="w-8 h-8 text-emerald-500 mb-2 opacity-50" />
                    <span>No hay registros para este filtro. Todo el sistema funciona correctamente.</span>
                  </div>
                ) : (
                  filteredLogs.map((log) => {
                    const badgeColor =
                      log.level === 'ERROR'
                        ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                        : log.level === 'WARN'
                        ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                        : log.level === 'DB'
                        ? 'text-purple-400 bg-purple-500/10 border-purple-500/20'
                        : 'text-blue-400 bg-blue-500/10 border-blue-500/20'

                    return (
                      <div
                        key={log.id}
                        className="p-2.5 rounded-lg bg-[#070710] border border-white/5 space-y-1 hover:border-white/15 transition"
                      >
                        <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500">
                          <div className="flex items-center gap-2">
                            <span className={`px-1.5 py-0.5 rounded-md border font-bold text-[9px] ${badgeColor}`}>
                              {log.level}
                            </span>
                            <span className="text-slate-300 font-semibold">{log.category}</span>
                          </div>
                          <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>

                        <div className="text-slate-200">{log.message}</div>

                        {log.details && (
                          <pre className="p-1.5 rounded bg-black/50 text-[10px] text-slate-400 overflow-x-auto">
                            {typeof log.details === 'string' ? log.details : JSON.stringify(log.details, null, 2)}
                          </pre>
                        )}

                        {log.stack && (
                          <div className="text-[10px] text-rose-400/80 overflow-x-auto max-h-20 whitespace-pre-wrap">
                            {log.stack}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 bg-[#06060c] flex justify-end">
          <ShimmerButton
            type="button"
            variant="primary"
            size="md"
            onClick={onClose}
          >
            Listo
          </ShimmerButton>
        </div>
      </div>
    </div>
  )
}
