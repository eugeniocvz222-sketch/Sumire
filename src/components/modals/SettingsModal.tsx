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
  Bot,
  Cpu,
  Key,
  Globe,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { SYSTEM_THEMES, SystemTheme } from '../common/ThemeConfig'
import { ShimmerButton } from '../reactbits/ShimmerButton'
import { alerts } from '../../lib/alerts'
import { logger, LogEntry, LogLevel } from '../../lib/logger'
import { AIProviderType } from '../../types'
import { AIService } from '../../lib/aiService'

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

  // AI Settings State
  const [aiProvider, setAiProvider] = useState<AIProviderType>(settings.aiConfig?.provider || 'gemini')
  const [geminiKey, setGeminiKey] = useState(settings.aiConfig?.geminiApiKey || '')
  const [geminiModel, setGeminiModel] = useState(settings.aiConfig?.geminiModel || 'gemini-2.0-flash')
  const [openaiKey, setOpenaiKey] = useState(settings.aiConfig?.openaiApiKey || '')
  const [openaiModel, setOpenaiModel] = useState(settings.aiConfig?.openaiModel || 'gpt-4o-mini')
  const [openaiBaseUrl, setOpenaiBaseUrl] = useState(settings.aiConfig?.openaiBaseUrl || 'https://api.openai.com/v1')
  const [ollamaEndpoint, setOllamaEndpoint] = useState(settings.aiConfig?.ollamaEndpoint || 'http://localhost:11434')
  const [ollamaModel, setOllamaModel] = useState(settings.aiConfig?.ollamaModel || 'gemma4-e2b-it')
  const [isTestingAI, setIsTestingAI] = useState(false)
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; message: string } | null>(null)

  // Ollama Auto-Scan Models State
  const [ollamaModels, setOllamaModels] = useState<Array<{ name: string; size?: number }>>([])
  const [isScanningOllama, setIsScanningOllama] = useState(false)
  const [ollamaScanError, setOllamaScanError] = useState<string | null>(null)
  const [isManualOllamaModel, setIsManualOllamaModel] = useState(false)

  // Logs state
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [logFilter, setLogFilter] = useState<'ALL' | LogLevel>('ALL')
  const [copiedLogs, setCopiedLogs] = useState(false)

  const handleScanOllama = async (endpointToScan?: string) => {
    const target = endpointToScan || ollamaEndpoint || 'http://localhost:11434'
    setIsScanningOllama(true)
    setOllamaScanError(null)
    try {
      const models = await AIService.getOllamaModels(target)
      setOllamaModels(models)
      if (models.length > 0) {
        if (!models.some((m) => m.name === ollamaModel)) {
          setOllamaModel(models[0].name)
        }
        alerts.success('Modelos detectados', `Se encontraron ${models.length} modelos en Ollama.`)
      } else {
        setOllamaScanError('Ollama respondió pero no tienes ningún modelo descargado todavía.')
      }
    } catch (e: any) {
      setOllamaScanError(e.message || 'No se pudo conectar al servidor Ollama local.')
    } finally {
      setIsScanningOllama(false)
    }
  }

  // Auto-scan Ollama models when modal opens or provider is set to ollama
  useEffect(() => {
    if (isOpen && aiProvider === 'ollama' && ollamaModels.length === 0 && !isScanningOllama) {
      handleScanOllama()
    }
  }, [isOpen, aiProvider])

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

  const handleSaveAISettings = () => {
    updateSettings({
      aiConfig: {
        provider: aiProvider,
        geminiApiKey: geminiKey,
        geminiModel,
        openaiApiKey: openaiKey,
        openaiModel,
        openaiBaseUrl,
        ollamaEndpoint,
        ollamaModel,
      },
    })
    alerts.success('Configuración de IA Guardada', `Proveedor activo: ${aiProvider.toUpperCase()}`)
  }

  const handleTestAIConnection = async () => {
    setIsTestingAI(true)
    setAiTestResult(null)
    try {
      const res = await AIService.testConnection({
        provider: aiProvider,
        geminiApiKey: geminiKey,
        geminiModel,
        openaiApiKey: openaiKey,
        openaiModel,
        openaiBaseUrl,
        ollamaEndpoint,
        ollamaModel,
      })
      setAiTestResult(res)
      if (res.success) {
        alerts.success('Conexión Exitosa', res.message)
      } else {
        alerts.error('Fallo de Conexión', res.message)
      }
    } catch (e: any) {
      setAiTestResult({ success: false, message: e.message || 'Error desconocido' })
      alerts.error('Error', e.message)
    } finally {
      setIsTestingAI(false)
    }
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

              {/* Section 3: Hybrid AI Intelligence (Gemini / OpenAI / Ollama Local) */}
              <div className="bg-[#06060c] p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-white font-bold">
                    <Bot className="w-4 h-4 text-purple-400" />
                    <span>Inteligencia Artificial Híbrida (Sumire AI)</span>
                  </div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 font-semibold">
                    Local & Nube
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Genera resúmenes inteligentes, puntos clave y ayuda de estudio para tus notas usando la <strong>API gratuita de Google Gemini</strong>, <strong>OpenAI / DeepSeek</strong> o modelos locales con <strong>Ollama</strong> (100% offline).
                </p>

                {/* Provider Selector Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setAiProvider('gemini')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition cursor-pointer ${
                      aiProvider === 'gemini'
                        ? 'bg-purple-600/20 border-purple-500 text-white'
                        : 'bg-[#0c0c16] border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Google Gemini</span>
                    <span className="text-[9px] text-emerald-400 font-normal">Recomendado / Gratis</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiProvider('openai')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition cursor-pointer ${
                      aiProvider === 'openai'
                        ? 'bg-purple-600/20 border-purple-500 text-white'
                        : 'bg-[#0c0c16] border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Globe className="w-4 h-4 text-blue-400" />
                    <span>OpenAI / DeepSeek</span>
                    <span className="text-[9px] text-slate-400 font-normal">GPT-4o / DeepSeek</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiProvider('ollama')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition cursor-pointer ${
                      aiProvider === 'ollama'
                        ? 'bg-purple-600/20 border-purple-500 text-white'
                        : 'bg-[#0c0c16] border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Cpu className="w-4 h-4 text-amber-400" />
                    <span>Ollama Local</span>
                    <span className="text-[9px] text-amber-400 font-normal">100% Offline / Privado</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAiProvider('off')}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1 transition cursor-pointer ${
                      aiProvider === 'off'
                        ? 'bg-purple-600/20 border-purple-500 text-white'
                        : 'bg-[#0c0c16] border-white/5 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <X className="w-4 h-4 text-rose-400" />
                    <span>Desactivada</span>
                    <span className="text-[9px] text-slate-500 font-normal">Sin funciones IA</span>
                  </button>
                </div>

                {/* Gemini Fields */}
                {aiProvider === 'gemini' && (
                  <div className="space-y-3 p-3.5 bg-[#0c0c16] rounded-xl border border-white/5">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-purple-400" />
                          Gemini API Key
                        </label>
                        <a
                          href="https://aistudio.google.com/app/apikey"
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-purple-400 hover:text-purple-300 inline-flex items-center gap-1"
                        >
                          Obtener clave gratis <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <input
                        type="password"
                        placeholder="AIzaSy..."
                        value={geminiKey}
                        onChange={(e) => setGeminiKey(e.target.value)}
                        className="w-full px-3 py-2 bg-[#06060c] border border-white/10 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-hidden focus:border-purple-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Modelo de Gemini</label>
                      <select
                        value={geminiModel}
                        onChange={(e) => setGeminiModel(e.target.value)}
                        className="w-full px-3 py-2 bg-[#06060c] border border-white/10 rounded-xl text-white text-xs focus:outline-hidden focus:border-purple-500"
                      >
                        <option value="gemini-2.0-flash">Gemini 2.0 Flash (Ultra rápido y recomendado)</option>
                        <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* OpenAI Fields */}
                {aiProvider === 'openai' && (
                  <div className="space-y-3 p-3.5 bg-[#0c0c16] rounded-xl border border-white/5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-blue-400" />
                        API Key (OpenAI / OpenRouter / DeepSeek)
                      </label>
                      <input
                        type="password"
                        placeholder="sk-..."
                        value={openaiKey}
                        onChange={(e) => setOpenaiKey(e.target.value)}
                        className="w-full px-3 py-2 bg-[#06060c] border border-white/10 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-hidden focus:border-blue-500 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Base URL (Opcional)</label>
                        <input
                          type="text"
                          placeholder="https://api.openai.com/v1"
                          value={openaiBaseUrl}
                          onChange={(e) => setOpenaiBaseUrl(e.target.value)}
                          className="w-full px-3 py-2 bg-[#06060c] border border-white/10 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-hidden focus:border-blue-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Modelo</label>
                        <input
                          type="text"
                          placeholder="gpt-4o-mini"
                          value={openaiModel}
                          onChange={(e) => setOpenaiModel(e.target.value)}
                          className="w-full px-3 py-2 bg-[#06060c] border border-white/10 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-hidden focus:border-blue-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Ollama Fields with Auto-Scan */}
                {aiProvider === 'ollama' && (
                  <div className="space-y-3 p-3.5 bg-[#0c0c16] rounded-xl border border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                            <Cpu className="w-3.5 h-3.5 text-amber-400" />
                            Endpoint Servidor Ollama
                          </label>
                        </div>
                        <input
                          type="text"
                          placeholder="http://localhost:11434"
                          value={ollamaEndpoint}
                          onChange={(e) => setOllamaEndpoint(e.target.value)}
                          className="w-full px-3 py-2 bg-[#06060c] border border-white/10 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-hidden focus:border-amber-500 font-mono"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                            <Bot className="w-3.5 h-3.5 text-amber-400" />
                            Modelo Local
                          </label>
                          <button
                            type="button"
                            onClick={() => handleScanOllama()}
                            disabled={isScanningOllama}
                            className="text-[11px] text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 cursor-pointer disabled:opacity-50 font-medium"
                          >
                            <RefreshCw className={`w-3 h-3 ${isScanningOllama ? 'animate-spin' : ''}`} />
                            {isScanningOllama ? 'Escaneando...' : 'Escanear Modelos'}
                          </button>
                        </div>

                        {!isManualOllamaModel && ollamaModels.length > 0 ? (
                          <div className="space-y-1">
                            <select
                              value={ollamaModel}
                              onChange={(e) => setOllamaModel(e.target.value)}
                              className="w-full px-3 py-2 bg-[#06060c] border border-white/10 rounded-xl text-white text-xs focus:outline-hidden focus:border-amber-500 font-mono cursor-pointer"
                            >
                              {ollamaModels.map((m) => {
                                const sizeGb = m.size ? ` (${(m.size / 1024 / 1024 / 1024).toFixed(1)} GB)` : ''
                                return (
                                  <option key={m.name} value={m.name}>
                                    ✨ {m.name}{sizeGb}
                                  </option>
                                )
                              })}
                            </select>
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => setIsManualOllamaModel(true)}
                                className="text-[10px] text-slate-500 hover:text-slate-300 transition cursor-pointer"
                              >
                                Escribir nombre manual
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <input
                              type="text"
                              placeholder="gemma4-e2b-it o gemma:latest"
                              value={ollamaModel}
                              onChange={(e) => setOllamaModel(e.target.value)}
                              className="w-full px-3 py-2 bg-[#06060c] border border-white/10 rounded-xl text-white text-xs placeholder-slate-600 focus:outline-hidden focus:border-amber-500 font-mono"
                            />
                            {ollamaModels.length > 0 && (
                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => setIsManualOllamaModel(false)}
                                  className="text-[10px] text-amber-400 hover:text-amber-300 transition font-medium cursor-pointer"
                                >
                                  Ver lista detectada ({ollamaModels.length})
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Scan feedback / detected summary */}
                    {ollamaModels.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                          <span><strong>{ollamaModels.length}</strong> {ollamaModels.length === 1 ? 'modelo detectado' : 'modelos detectados'} en tu equipo</span>
                        </span>
                        <span className="text-[10px] opacity-75 font-mono">Activo: {ollamaModel}</span>
                      </div>
                    )}

                    {ollamaScanError && (
                      <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          <span>{ollamaScanError}</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => handleScanOllama()}
                          className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 transition cursor-pointer"
                        >
                          Reintentar
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons for AI */}
                {aiProvider !== 'off' && (
                  <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleTestAIConnection}
                      disabled={isTestingAI}
                      className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-slate-300 flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTestingAI ? 'animate-spin' : ''}`} />
                      {isTestingAI ? 'Probando conexión...' : 'Probar Conexión'}
                    </button>

                    <ShimmerButton
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleSaveAISettings}
                    >
                      Guardar Configuración IA
                    </ShimmerButton>
                  </div>
                )}

                {aiTestResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                      aiTestResult.success
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {aiTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    )}
                    <span>{aiTestResult.message}</span>
                  </div>
                )}
              </div>

              {/* Section 4: Cloud Sync */}
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

              {/* Section 4: Backup, Restore & Machine Migration */}
              <div className="bg-[#06060c] p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-white font-bold">
                    <Download className="w-4 h-4 text-purple-400" />
                    <span>Migración de Datos y Copias de Seguridad</span>
                  </div>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 font-semibold">
                    Multi-Equipo
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Exporta todo tu perfil, cuatrimestres, libretas, notas con historial de versiones, tareas y calificaciones en un solo archivo <strong>.json</strong> para transferirlo a tu laptop o restaurarlo si cambias de equipo.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Export Box */}
                  <div className="p-3.5 rounded-xl bg-[#0c0c16] border border-white/5 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                        <Download className="w-3.5 h-3.5 text-purple-400" />
                        <span>Exportar Todos mis Datos</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Crea una copia completa lista para guardar en tu memoria USB, Drive o carpeta compartida.
                      </p>
                    </div>
                    <ShimmerButton
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        exportData()
                        alerts.success('Copia generada', 'El archivo de respaldo se descargó en tu equipo.')
                      }}
                      icon={<Download className="w-3.5 h-3.5" />}
                    >
                      Descargar Respaldo (.json)
                    </ShimmerButton>
                  </div>

                  {/* Import Box */}
                  <div className="p-3.5 rounded-xl bg-[#0c0c16] border border-white/5 space-y-2 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                        <Upload className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Restaurar en este Equipo</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Selecciona un archivo de respaldo generado previamente en otra computadora.
                      </p>
                    </div>
                    <label className="w-full px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Cargar Archivo .json</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileImport}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {importStatus && (
                  <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>{importStatus}</span>
                  </div>
                )}
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
