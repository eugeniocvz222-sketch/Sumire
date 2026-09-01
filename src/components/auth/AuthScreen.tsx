import React, { useState, useRef } from 'react'
import {
  GraduationCap,
  Mail,
  Lock,
  User,
  School,
  Upload,
  Camera,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { Plasma } from '../reactbits/Plasma'
import { ShinyText } from '../reactbits/ShinyText'
import { DecryptedText } from '../reactbits/DecryptedText'
import { ClickSpark } from '../reactbits/ClickSpark'
import { ShimmerButton } from '../reactbits/ShimmerButton'
import { alerts } from '../../lib/alerts'

const PRESET_AVATARS = [
  '/apuntes_mascot.png',
  'https://api.dicebear.com/7.x/bottts/svg?seed=student1',
  'https://api.dicebear.com/7.x/bottts/svg?seed=student2',
  'https://api.dicebear.com/7.x/bottts/svg?seed=coder3',
  'https://api.dicebear.com/7.x/bottts/svg?seed=engineer4',
  'https://api.dicebear.com/7.x/bottts/svg?seed=science5',
]

export const AuthScreen: React.FC = () => {
  const { loginWithPassword, registerWithPassword } = useApp()
  const [screen, setScreen] = useState<'login' | 'register'>('login')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Login Form
  const [loginEmail, setLoginEmail] = useState('eugenio@universidad.edu')
  const [loginPassword, setLoginPassword] = useState('123456789')

  // Register Form
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regCareer, setRegCareer] = useState('')
  const [regUniversity, setRegUniversity] = useState('')
  const [avatar, setAvatar] = useState(PRESET_AVATARS[0])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Upload Local Image to Base64 (syncs everywhere)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 3 * 1024 * 1024) {
      alerts.error('Imagen muy pesada', 'Elige una foto menor a 3 MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setAvatar(event.target.result)
        alerts.success('Foto cargada', 'Se sincronizará con tu cuenta')
      }
    }
    reader.readAsDataURL(file)
  }

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail.trim() || !loginPassword.trim()) {
      alerts.error('Campos requeridos', 'Ingresa tu correo y contraseña')
      return
    }

    setIsLoading(true)
    try {
      const res = await loginWithPassword(loginEmail.trim(), loginPassword.trim())
      if (!res.success) {
        alerts.error('Error de acceso', res.error || 'Credenciales incorrectas')
      } else {
        alerts.success('¡Bienvenido de nuevo!', `Sesión iniciada como ${res.user?.name}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      alerts.error('Campos requeridos', 'Completa los campos obligatorios')
      return
    }

    if (regPassword.length < 6) {
      alerts.error('Contraseña débil', 'Debe tener al menos 6 caracteres')
      return
    }

    setIsLoading(true)
    try {
      const res = await registerWithPassword(
        {
          name: regName.trim(),
          email: regEmail.trim(),
          career: regCareer.trim() || 'Ingeniería en Software',
          university: regUniversity.trim() || 'Mi Universidad',
          avatar,
        },
        regPassword.trim()
      )

      if (!res.success) {
        alerts.error('Error al registrarse', res.error || 'No se pudo crear la cuenta')
      } else {
        alerts.success('¡Cuenta creada con éxito!', `Bienvenido ${regName}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#030306] flex items-center justify-center p-4 select-none">
      {/* Background Plasma Effect */}
      <Plasma />

      {/* Auth Card Container */}
      <div className="relative z-10 w-full max-w-md bg-[#0a0a14]/90 backdrop-blur-2xl border border-purple-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-purple-950/50">
        {screen === 'login' ? (
          <div className="space-y-6">
            {/* Header Brand */}
            <div className="text-center space-y-2">
              <div className="relative w-20 h-20 rounded-3xl overflow-hidden mx-auto shadow-2xl shadow-purple-600/50 ring-2 ring-purple-400/50 group bg-[#05050a]">
                <img src="/apuntes_mascot.png" alt="Apuntes AI Mascot" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <h1 className="text-2xl font-black text-white tracking-tight">
                <ShinyText text="Sumire" speed={3.5} />
              </h1>
              <p className="text-xs text-slate-300 max-w-xs mx-auto">
                Inicia sesión en Sumire para acceder a tus cuatrimestres, libretas y notas con IA.
              </p>
            </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-purple-400" /> Correo Institucional / Usuario
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ejemplo@universidad.edu"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 text-xs transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-purple-400" /> Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-black/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 text-xs pr-10 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <ClickSpark sparkColor="#c084fc" sparkCount={10}>
                  <ShimmerButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full mt-2"
                    disabled={isLoading}
                    icon={
                      isLoading ? (
                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )
                    }
                  >
                    {isLoading ? 'Iniciando sesión...' : 'Entrar a Mis Apuntes'}
                  </ShimmerButton>
                </ClickSpark>
              </form>

              {/* Link to Register */}
              <div className="pt-2 text-center border-t border-white/5">
                <span className="text-xs text-slate-300">¿No tienes cuenta todavía? </span>
                <button
                  type="button"
                  onClick={() => setScreen('register')}
                  className="text-xs text-purple-400 hover:text-purple-300 font-bold cursor-pointer transition hover:underline"
                >
                  Regístrate aquí
                </button>
              </div>
            </div>
          ) : (
            /* REGISTER SCREEN */
            <div className="space-y-5">
              {/* Header Brand */}
              <div className="text-center space-y-1.5">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden mx-auto shadow-xl shadow-purple-600/40 ring-2 ring-purple-400/40 bg-[#05050a]">
                  <img src="/apuntes_mascot.png" alt="Sumire AI Mascot" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-xl font-black text-white tracking-tight">
                  <ShinyText text="Crear Cuenta en Sumire" speed={3.5} />
                </h1>
                <p className="text-xs text-slate-300 max-w-xs mx-auto">
                  Registra tus datos para sincronizar tus libretas en todas tus PCs.
                </p>
              </div>

              {/* Register Form */}
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Avatar / Photo Upload */}
                <div className="flex flex-col items-center justify-center gap-2 pb-1">
                  <div className="relative group">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border-2 border-purple-500/60 overflow-hidden shadow-lg flex items-center justify-center">
                      {avatar ? (
                        <img src={avatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-slate-400" />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-md transition cursor-pointer"
                      title="Subir foto desde tu computadora"
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {PRESET_AVATARS.slice(0, 5).map((pAvatar, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAvatar(pAvatar)}
                        className={`w-7 h-7 rounded-lg bg-slate-900 border overflow-hidden transition cursor-pointer ${
                          avatar === pAvatar ? 'border-purple-500 scale-110 shadow-sm' : 'border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={pAvatar} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2 py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 rounded-lg text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-2.5 h-2.5" /> Subir foto
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-purple-400" /> Tu Nombre Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Eugenio"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-black/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 text-xs transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-purple-400" /> Correo Institucional *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="eugenio@universidad.edu"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-black/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 text-xs transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-purple-400" /> Carrera
                    </label>
                    <input
                      type="text"
                      placeholder="Ing. Software"
                      value={regCareer}
                      onChange={(e) => setRegCareer(e.target.value)}
                      className="w-full px-3.5 py-2 bg-black/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 text-xs transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-white mb-1 flex items-center gap-1.5">
                      <School className="w-3.5 h-3.5 text-purple-400" /> Universidad
                    </label>
                    <input
                      type="text"
                      placeholder="Mi Universidad"
                      value={regUniversity}
                      onChange={(e) => setRegUniversity(e.target.value)}
                      className="w-full px-3.5 py-2 bg-black/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 text-xs transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-white mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-purple-400" /> Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Mínimo 6 caracteres"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-3.5 py-2 bg-black/70 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 text-xs pr-10 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <ClickSpark sparkColor="#c084fc" sparkCount={10}>
                  <ShimmerButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full mt-2"
                    disabled={isLoading}
                    icon={
                      isLoading ? (
                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )
                    }
                  >
                    {isLoading ? 'Creando cuenta...' : 'Crear Cuenta y Comenzar'}
                  </ShimmerButton>
                </ClickSpark>
              </form>

              {/* Link to Login */}
              <div className="text-center pt-2 border-t border-white/5">
                <span className="text-xs text-slate-300">¿Ya tienes una cuenta? </span>
                <button
                  type="button"
                  onClick={() => setScreen('login')}
                  className="text-xs text-purple-400 hover:text-purple-300 font-bold cursor-pointer transition hover:underline"
                >
                  Inicia sesión aquí
                </button>
              </div>
            </div>
          )}
      </div>
    </div>
  )
}
