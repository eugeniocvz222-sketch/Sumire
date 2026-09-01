import React, { useState, useRef } from 'react'
import { X, User, Mail, GraduationCap, School, Upload, Camera, Check, Sparkles, LogIn, UserPlus } from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { alerts } from '../../lib/alerts'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'register' | 'profile'
}

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=student1',
  'https://api.dicebear.com/7.x/bottts/svg?seed=student2',
  'https://api.dicebear.com/7.x/bottts/svg?seed=coder3',
  'https://api.dicebear.com/7.x/bottts/svg?seed=engineer4',
  'https://api.dicebear.com/7.x/bottts/svg?seed=science5',
  'https://api.dicebear.com/7.x/bottts/svg?seed=cyber6',
]

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'profile',
}) => {
  const { user, register, login, updateProfile, logout } = useApp()
  const [mode, setMode] = useState<'login' | 'register' | 'profile'>(initialMode)

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [career, setCareer] = useState(user?.career || '')
  const [university, setUniversity] = useState(user?.university || '')
  const [avatar, setAvatar] = useState(user?.avatar || PRESET_AVATARS[0])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync state when opened or user changes
  React.useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
      setCareer(user.career || '')
      setUniversity(user.university || '')
      setAvatar(user.avatar || PRESET_AVATARS[0])
    }
  }, [user, isOpen])

  if (!isOpen) return null

  // Convert uploaded image file to Base64 so it syncs across PCs seamlessly
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alerts.error('Imagen muy grande', 'Elige una imagen de máximo 2 MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setAvatar(event.target.result)
        alerts.success('Foto cargada', 'Se guardará en tus datos locales')
      }
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (mode === 'login') {
      if (!name.trim()) return
      login(email || `${name.toLowerCase()}@universidad.edu`, name.trim())
      alerts.success(`¡Bienvenido, ${name}!`)
      onClose()
    } else if (mode === 'register') {
      if (!name.trim()) return
      register({
        name: name.trim(),
        email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@universidad.edu`,
        career: career.trim() || 'Ingeniería en Software',
        university: university.trim() || 'Mi Universidad',
        avatar,
      })
      alerts.success(`¡Cuenta creada con éxito!`, `Bienvenido ${name}`)
      onClose()
    } else if (mode === 'profile') {
      updateProfile({
        name: name.trim(),
        email: email.trim(),
        career: career.trim(),
        university: university.trim(),
        avatar,
      })
      alerts.success('Perfil actualizado')
      onClose()
    }
  }

  const handleLogout = async () => {
    const confirmed = await alerts.confirm({
      title: '¿Cerrar sesión?',
      text: 'Podrás volver a ingresar en cualquier momento.',
      confirmButtonText: 'Cerrar sesión',
      cancelButtonText: 'Cancelar',
      icon: 'question',
    })
    if (confirmed) {
      logout()
      alerts.info('Sesión cerrada')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#07070b] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Glow ambient accent */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-40 bg-purple-600/20 blur-3xl rounded-full pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {mode === 'profile'
                  ? 'Mi Perfil de Estudiante'
                  : mode === 'register'
                  ? 'Crear Cuenta Estudiantil'
                  : 'Iniciar Sesión'}
              </h2>
              <p className="text-xs text-slate-400">
                Tus datos y foto se sincronizan automáticamente entre tu laptop y PC
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-900 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Switcher (if not profile mode or to toggle) */}
        <div className="px-6 pt-4 flex gap-2 border-b border-slate-800/60 pb-3">
          <button
            type="button"
            onClick={() => setMode('profile')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              mode === 'profile'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Perfil
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              mode === 'register'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Registrar / Cambiar
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
              mode === 'login'
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            Ingresar
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Avatar Section */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-slate-900 border-2 border-purple-500/50 overflow-hidden shadow-xl flex items-center justify-center">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-10 h-10 text-slate-500" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg transition cursor-pointer"
                title="Subir foto desde tu computadora"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer mx-auto"
              >
                <Upload className="w-3.5 h-3.5" /> Subir foto desde tu PC (Laptop o Escritorio)
              </button>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Se guardará en Base64 para que se sincronice en todas tus computadoras
              </p>
            </div>

            {/* Quick Preset Avatars */}
            <div className="flex items-center gap-2 pt-1">
              {PRESET_AVATARS.map((pAvatar, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAvatar(pAvatar)}
                  className={`w-8 h-8 rounded-xl bg-slate-900 border overflow-hidden transition cursor-pointer ${
                    avatar === pAvatar ? 'border-purple-500 scale-110 shadow-sm' : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={pAvatar} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Input Fields */}
          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-400" /> Nombre de Estudiante *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Eugenio"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-purple-400" /> Correo Institucional / Personal
              </label>
              <input
                type="email"
                placeholder="Ej. eugenio@universidad.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-400" /> Carrera
                </label>
                <input
                  type="text"
                  placeholder="Ej. Ing. en Software"
                  value={career}
                  onChange={(e) => setCareer(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white mb-1.5 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-purple-400" /> Universidad
                </label>
                <input
                  type="text"
                  placeholder="Ej. Mi Universidad"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-purple-500 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs text-rose-400 hover:text-rose-300 font-semibold transition cursor-pointer"
              >
                Cerrar Sesión
              </button>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 text-xs font-semibold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Guardar Perfil
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
