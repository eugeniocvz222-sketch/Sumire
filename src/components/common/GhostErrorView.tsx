import React, { useState } from 'react'
import { ShimmerButton } from '../reactbits/ShimmerButton'
import {
  RotateCcw,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Terminal,
} from 'lucide-react'
import { logger } from '../../lib/logger'
import { alerts } from '../../lib/alerts'

interface GhostErrorViewProps {
  error?: Error | null
  errorInfo?: React.ErrorInfo | null
  title?: string
  message?: string
  errorCode?: string | number
  onReset?: () => void
}

export const GhostErrorView: React.FC<GhostErrorViewProps> = ({
  error,
  errorInfo,
  title = '¡Oops! Algo desapareció en el éter',
  message = 'Ha ocurrido un error inesperado al cargar esta sección. No te preocupes, tus apuntes y datos en la base de datos están completamente a salvo.',
  errorCode = '404',
  onReset,
}) => {
  const [showDetails, setShowDetails] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopyLogs = () => {
    const errorDetails = {
      code: errorCode,
      name: error?.name || 'UnknownError',
      message: error?.message || 'No error message',
      stack: error?.stack || 'No stack trace available',
      componentStack: errorInfo?.componentStack || 'No component stack',
      systemLogs: logger.getLogs().slice(-20),
    }

    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
    setCopied(true)
    alerts.success('Diagnóstico copiado', 'Puedes enviarlo para resolver el problema')
    setTimeout(() => setCopied(false), 2500)
  }

  const handleDownloadReport = () => {
    const reportStr = logger.exportReport()
    const blob = new Blob([reportStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte-error-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    alerts.success('Reporte descargado', 'Archivo JSON generado con éxito')
  }

  const handleReload = () => {
    if (onReset) {
      onReset()
    } else {
      window.location.reload()
    }
  }

  return (
    <div className="relative min-h-[550px] w-full flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-[#030306] text-white overflow-hidden select-none">
      {/* Deep Atmospheric Glow Gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none" />

      {/* Floating Ghost Illustration (21st.dev Style) */}
      <div className="relative z-10 flex flex-col items-center mb-6">
        {/* Ghost SVG with Smooth CSS Float Keyframes */}
        <div className="relative animate-bounce duration-[3000ms] ease-in-out">
          <svg
            width="180"
            height="210"
            viewBox="0 0 180 210"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-[0_15px_30px_rgba(168,85,247,0.35)] transition-transform duration-500 hover:scale-105"
          >
            {/* Ambient Aura Halo */}
            <circle cx="90" cy="95" r="75" fill="url(#ghost-glow)" opacity="0.6" />

            {/* Ghost Outer Body */}
            <path
              d="M35 155C35 85 45 30 90 30C135 30 145 85 145 155C145 168 135 178 125 170C116 163 108 178 99 174C90 170 82 178 73 172C64 166 56 178 47 170C39 162 35 145 35 155Z"
              fill="url(#ghost-gradient)"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="2"
            />

            {/* Glowing Cheeks */}
            <circle cx="62" cy="106" r="7" fill="#f43f5e" opacity="0.45" filter="blur(2px)" />
            <circle cx="118" cy="106" r="7" fill="#f43f5e" opacity="0.45" filter="blur(2px)" />

            {/* Cute Expressive Eyes */}
            <ellipse cx="68" cy="92" rx="5" ry="7" fill="#09090b" />
            <circle cx="70" cy="89" r="2.2" fill="#ffffff" />

            <ellipse cx="112" cy="92" rx="5" ry="7" fill="#09090b" />
            <circle cx="114" cy="89" r="2.2" fill="#ffffff" />

            {/* Smiling Little Mouth */}
            <path
              d="M84 105C87 109 93 109 96 105"
              stroke="#09090b"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Floating Ghost Hands */}
            <path
              d="M32 108C22 108 18 118 24 125C29 130 38 124 38 116"
              fill="url(#ghost-gradient)"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="1.5"
            />
            <path
              d="M148 108C158 108 162 118 156 125C151 130 142 124 142 116"
              fill="url(#ghost-gradient)"
              stroke="rgba(255, 255, 255, 0.4)"
              strokeWidth="1.5"
            />

            {/* Little Magic Sparkles */}
            <path
              d="M152 48L154 54L160 56L154 58L152 64L150 58L144 56L150 54L152 48Z"
              fill="#c084fc"
              opacity="0.8"
            />
            <path
              d="M26 62L27.5 66.5L32 68L27.5 69.5L26 74L24.5 69.5L20 68L24.5 66.5L26 62Z"
              fill="#818cf8"
              opacity="0.8"
            />

            {/* Gradients */}
            <defs>
              <linearGradient id="ghost-gradient" x1="90" y1="30" x2="90" y2="180" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ffffff" />
                <stop offset="0.75" stopColor="#e0e7ff" />
                <stop offset="1" stopColor="#c7d2fe" />
              </linearGradient>
              <radialGradient id="ghost-glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(90 95) scale(75)">
                <stop stopColor="#a855f7" stopOpacity="0.4" />
                <stop offset="1" stopColor="#a855f7" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* Pulsing Shadow on Ground */}
        <div className="w-28 h-3.5 bg-purple-500/20 rounded-[100%] blur-[4px] mt-1 transition-all duration-1000 scale-95" />
      </div>

      {/* Error Badge & Titles */}
      <div className="relative z-10 max-w-lg text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-300">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>Error {errorCode}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {title}
        </h2>

        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md mx-auto">
          {message}
        </p>
      </div>

      {/* Action Buttons (21st.dev Shimmer Style) */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 mt-7">
        <ShimmerButton
          onClick={handleReload}
          variant="primary"
          size="md"
          icon={<RotateCcw className="w-4 h-4" />}
        >
          Reintentar / Recargar
        </ShimmerButton>

        <ShimmerButton
          onClick={() => {
            window.location.href = '/'
          }}
          variant="glass"
          size="md"
          icon={<BookOpen className="w-4 h-4" />}
        >
          Ir a Mis Libretas
        </ShimmerButton>
      </div>

      {/* Diagnostic & Technical Stack Trace (Collapsible) */}
      <div className="relative z-10 w-full max-w-xl mt-8">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between p-3.5 bg-[#0a0a14] hover:bg-[#0f0f1e] border border-white/10 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition"
        >
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            <span>Detalles Técnicos y Diagnóstico de Error</span>
          </div>
          {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showDetails && (
          <div className="mt-2 p-4 bg-[#07070f] border border-white/10 rounded-xl space-y-3 text-left animate-in fade-in duration-200">
            <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
              <span className="text-[11px] font-mono text-purple-300">
                {error?.name || 'Application_Runtime_Error'}: {error?.message || 'Error no controlado'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyLogs}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-[10px] text-slate-300 flex items-center gap-1 transition"
                  title="Copiar detalles al portapapeles"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-[10px] text-slate-300 flex items-center gap-1 transition"
                  title="Descargar reporte completo JSON"
                >
                  <Download className="w-3 h-3" />
                  Reporte
                </button>
              </div>
            </div>

            {error?.stack && (
              <div className="max-h-40 overflow-y-auto bg-black/60 p-2.5 rounded-lg border border-white/5 font-mono text-[10px] text-rose-300/80 leading-relaxed whitespace-pre-wrap">
                {error.stack}
              </div>
            )}

            {errorInfo?.componentStack && (
              <div className="max-h-32 overflow-y-auto bg-black/40 p-2.5 rounded-lg border border-white/5 font-mono text-[10px] text-slate-400 leading-relaxed whitespace-pre-wrap">
                <span className="text-slate-500 block mb-1">Pila de Componentes React:</span>
                {errorInfo.componentStack}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
