import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  BookOpen,
  Bot,
  Calendar,
  User,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Keyboard,
  FileText,
  Clock,
  Palette,
  Shield,
  Lightbulb,
  Zap,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { ShimmerButton } from '../reactbits/ShimmerButton'
import { ClickSpark } from '../reactbits/ClickSpark'
import { alerts } from '../../lib/alerts'
import { MASCOT_IMAGE } from '../../lib/mascot'

interface OnboardingDialogProps {
  isOpen: boolean
  onClose: () => void
}

interface StepData {
  id: string
  badge: string
  title: string
  subtitle: string
  icon: React.ReactNode
  accentColor: string
  content: React.ReactNode
}

export const OnboardingDialog: React.FC<OnboardingDialogProps> = ({ isOpen, onClose }) => {
  const { user } = useApp()
  const [currentStep, setCurrentStep] = useState(0)

  // Reset step when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0)
    }
  }, [isOpen])

  if (!isOpen) return null

  const steps: StepData[] = [
    {
      id: 'welcome',
      badge: '¡Bienvenido a Sumire!',
      title: 'Tu Compañera Universitaria con IA',
      subtitle: 'Diseñada para elevar tu aprendizaje, organizar tus semestres y dominar tus materias.',
      icon: <Sparkles className="w-6 h-6 text-purple-400" />,
      accentColor: 'from-purple-600 to-indigo-600',
      content: (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden border border-purple-500/20 bg-gradient-to-b from-purple-950/40 via-purple-900/20 to-black/60 p-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 rounded-2xl bg-[#080812] border-2 border-purple-500/40 p-1 shadow-xl shadow-purple-900/40 overflow-hidden flex items-center justify-center">
                <img
                  src={MASCOT_IMAGE}
                  alt="Sumire Mascot"
                  className="w-full h-full object-contain hover:scale-105 transition-transform"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-500 text-[10px] font-bold text-black shadow-xs">
                IA Activa
              </span>
            </div>

            <h4 className="text-base font-bold text-white mb-1">
              Hola, {user?.name || 'Estudiante'} 👋
            </h4>
            <p className="text-xs text-slate-300 max-w-md leading-relaxed">
              Sumire integra un entorno de notas en Markdown con fórmulas matemáticas LaTeX,
              gestor de tareas por fechas de entrega y un copiloto de inteligencia artificial listo
              para ayudarte en cualquier momento.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20">
              <div className="text-purple-400 font-bold text-sm">100% Local</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Plug & Play Offline</div>
            </div>
            <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20">
              <div className="text-indigo-400 font-bold text-sm">LaTeX & Código</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Fórmulas & Syntax</div>
            </div>
            <div className="p-3 rounded-xl bg-pink-950/30 border border-pink-500/20">
              <div className="text-pink-400 font-bold text-sm">IA Híbrida</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Gemini & Ollama Local</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'notebooks',
      badge: 'Módulo 1: Organización',
      title: 'Libretas Universitarias & Apuntes',
      subtitle: 'Agrupa tus materias por cuatrimestre o semestre con portadas y paletas personalizadas.',
      icon: <BookOpen className="w-6 h-6 text-purple-400" />,
      accentColor: 'from-purple-600 to-pink-600',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-[#0d0d1a] border border-purple-500/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>Libretas por Materia</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Crea libretas para cada materia (ej. <em>Estructuras de Datos, Cálculo, Redes</em>).
                Asigna colores temáticos e íconos representativos.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0d0d1a] border border-purple-500/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Editor Markdown & LaTeX</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Escribe apuntes ricos con tablas, bloques de código en vivo y expresiones matemáticas
                como <code className="text-purple-300 font-mono text-[11px] bg-purple-950/60 px-1 py-0.5 rounded">E = mc²</code>.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/30 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-300">
              <strong className="text-white">Tip de productividad:</strong> Puedes exportar cualquier apunte a un PDF universitario limpio con un solo clic.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'ai_tutor',
      badge: 'Módulo 2: Inteligencia Artificial',
      title: 'Tutor de Estudio & Quizzes con IA',
      subtitle: 'Multiplica tu retención de conceptos antes de exámenes importantes.',
      icon: <Bot className="w-6 h-6 text-purple-400" />,
      accentColor: 'from-purple-600 to-emerald-600',
      content: (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#0d0d1a] border border-purple-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                Herramientas IA integradas
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-semibold">
                Sumire Engine
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="font-bold text-purple-300">📝 Resumen Inteligente</div>
                <div className="text-[11px] text-slate-400">Condensa notas largas en puntos clave y fórmulas.</div>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="font-bold text-emerald-300">🎯 Quizzes de Práctica</div>
                <div className="text-[11px] text-slate-400">Genera preguntas tipo examen para auto-evaluarte.</div>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 space-y-1">
                <div className="font-bold text-cyan-300">💡 Dudas Paso a Paso</div>
                <div className="text-[11px] text-slate-400">Pídele analogías simples de temas complejos.</div>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-300">
              Tus apuntes se procesan de forma privada respetando tu información académica.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'tasks_schedule',
      badge: 'Módulo 3: Gestión de Tiempos',
      title: 'Tareas, Entregables y Horario Semanal',
      subtitle: 'Evita retrasos en tus proyectos con semáforos de prioridad y calendario semanal.',
      icon: <Calendar className="w-6 h-6 text-purple-400" />,
      accentColor: 'from-purple-600 to-amber-600',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-[#0d0d1a] border border-purple-500/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Control de Entregas</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Registra proyectos, tareas y prácticas con fechas límite. El sistema te alertará automáticamente
                cuando se acerque una entrega prioritaria.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0d0d1a] border border-purple-500/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Horario Universitario</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Visualiza tus bloques de clase de lunes a sábado con aulas, nombres de profesores y materias.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-300">
              Puedes alternar entre tus cuatrimestres o semestres desde el selector en la esquina superior de la barra lateral.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'shortcuts',
      badge: 'Atajos & Productividad',
      title: 'Atajos de Teclado del Sistema',
      subtitle: 'Navega como un profesional y realiza acciones en milisegundos.',
      icon: <Keyboard className="w-6 h-6 text-purple-400" />,
      accentColor: 'from-purple-600 to-cyan-600',
      content: (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="flex items-center justify-between p-2.5 px-3 rounded-xl bg-[#0a0a14] border border-white/10 text-xs">
              <span className="text-slate-300">Buscador global rápido</span>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 rounded-md bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono font-bold text-[10px]">
                  Ctrl
                </kbd>
                <span className="text-slate-500">+</span>
                <kbd className="px-2 py-1 rounded-md bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono font-bold text-[10px]">
                  K
                </kbd>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 px-3 rounded-xl bg-[#0a0a14] border border-white/10 text-xs">
              <span className="text-slate-300">Colapsar / Abrir barra lateral</span>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 rounded-md bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono font-bold text-[10px]">
                  Ctrl
                </kbd>
                <span className="text-slate-500">+</span>
                <kbd className="px-2 py-1 rounded-md bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono font-bold text-[10px]">
                  B
                </kbd>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 px-3 rounded-xl bg-[#0a0a14] border border-white/10 text-xs">
              <span className="text-slate-300">Guardar apunte actual</span>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 rounded-md bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono font-bold text-[10px]">
                  Ctrl
                </kbd>
                <span className="text-slate-500">+</span>
                <kbd className="px-2 py-1 rounded-md bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono font-bold text-[10px]">
                  S
                </kbd>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 px-3 rounded-xl bg-[#0a0a14] border border-white/10 text-xs">
              <span className="text-slate-300">Exportar a PDF</span>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 rounded-md bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono font-bold text-[10px]">
                  Ctrl
                </kbd>
                <span className="text-slate-500">+</span>
                <kbd className="px-2 py-1 rounded-md bg-purple-950/80 border border-purple-500/40 text-purple-300 font-mono font-bold text-[10px]">
                  P
                </kbd>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-center text-xs text-purple-300 font-medium">
            💡 Puedes reabrir este tutorial en cualquier momento desde la barra superior o ajustes.
          </div>
        </div>
      ),
    },
    {
      id: 'profile_settings',
      badge: 'Personalización',
      title: 'Tu Perfil Universitario & Ajustes',
      subtitle: 'Configura tu foto, portada 4K, carrera y temas de color dinámicos.',
      icon: <User className="w-6 h-6 text-purple-400" />,
      accentColor: 'from-purple-600 to-violet-600',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-[#0d0d1a] border border-purple-500/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                <User className="w-4 h-4 text-purple-400" />
                <span>Perfil Universitario</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Haz clic en tu nombre o foto en la esquina inferior izquierda para editar tu matrícula, carrera, universidad y portada Ultra HD.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#0d0d1a] border border-purple-500/20 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-pink-300">
                <Palette className="w-4 h-4 text-pink-400" />
                <span>Temas de Color Neón</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Elige entre morado neón, ciberazul, esmeralda o carmesí desde el menú de Ajustes para adaptar la app a tu estilo.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/40 text-center space-y-1.5">
            <div className="text-sm font-bold text-white flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>¡Todo listo para comenzar tu mejor ciclo académico!</span>
            </div>
            <p className="text-xs text-slate-300">
              Crea tu primera materia o apunte y disfruta de la experiencia Sumire.
            </p>
          </div>
        </div>
      ),
    },
  ]

  const isLastStep = currentStep === steps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      handleFinish()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleFinish = () => {
    if (user?.id) {
      localStorage.setItem(`sumire_onboarding_completed_${user.id}`, 'true')
    } else {
      localStorage.setItem('sumire_onboarding_completed_guest', 'true')
    }
    onClose()
    alerts.success('¡Tutorial completado!', 'Bienvenido a Sumire. ¡Mucho éxito en tus materias!')
  }

  const activeStep = steps[currentStep]

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-xl bg-[#090912] border border-purple-500/30 rounded-3xl shadow-2xl shadow-purple-950/60 overflow-hidden flex flex-col my-auto transition-all"
      >
        {/* Top Header with Badge & Close Button */}
        <div className="relative p-6 pb-4 bg-gradient-to-b from-purple-950/30 to-transparent border-b border-white/5">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-purple-400" />
              {activeStep.badge}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">
                {currentStep + 1} / {steps.length}
              </span>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
                title="Cerrar tutorial"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>{activeStep.title}</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
            {activeStep.subtitle}
          </p>
        </div>

        {/* Modal Dynamic Body */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeStep.content}
        </div>

        {/* Modal Footer with Progress Dots & Navigation Buttons */}
        <div className="p-5 bg-black/40 border-t border-white/5 flex items-center justify-between gap-4">
          {/* Progress Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === currentStep
                    ? 'w-7 h-2 bg-purple-500 shadow-md shadow-purple-500/50'
                    : 'w-2 h-2 bg-slate-700 hover:bg-slate-500'
                }`}
                title={`Ir al paso ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Atrás</span>
              </button>
            )}

            {!isLastStep ? (
              <ClickSpark sparkColor="var(--theme-primary, #c084fc)" sparkCount={8}>
                <ShimmerButton
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleNext}
                  icon={<ChevronRight className="w-4 h-4" />}
                >
                  Siguiente
                </ShimmerButton>
              </ClickSpark>
            ) : (
              <ClickSpark sparkColor="var(--theme-primary, #c084fc)" sparkCount={14}>
                <ShimmerButton
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={handleFinish}
                  icon={<Sparkles className="w-4 h-4" />}
                >
                  ¡Empezar a Estudiar!
                </ShimmerButton>
              </ClickSpark>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
