import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Camera,
  Upload,
  User,
  Mail,
  GraduationCap,
  School,
  IdCard,
  FileText,
  Sparkles,
  BookOpen,
  CheckCircle2,
  Calendar,
  Shield,
  Download,
  Image as ImageIcon,
  Save,
  Award,
  X,
  Move,
  Maximize2,
  Minimize2,
  ZoomIn,
  Eye,
  Check,
  RotateCcw,
  Crop,
  Lock,
  Key,
  EyeOff,
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { MinimalBackground } from '../reactbits/MinimalBackground'
import { ClickSpark } from '../reactbits/ClickSpark'
import { ShimmerButton } from '../reactbits/ShimmerButton'
import { alerts } from '../../lib/alerts'
import { ImageCropper, CropAspectRatio } from './ImageCropper'
import { BannerFitMode, BannerHeightMode } from '../../types'
import { MASCOT_IMAGE } from '../../lib/mascot'

const PRESET_BANNERS = [
  {
    id: 'gargantua_space',
    label: 'Gargantua Black Hole (Interstellar 4K)',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?q=100&w=2560&auto=format&fit=crop',
  },
  {
    id: 'porsche_gt3',
    label: 'Porsche GT3 Black (Ultra HD)',
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=100&w=2560&auto=format&fit=crop',
  },
  {
    id: 'cyberpunk_city',
    label: 'Cyberpunk Neon Skyline',
    url: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=100&w=2560&auto=format&fit=crop',
  },
  {
    id: 'anime_study',
    label: 'Anime Lofi Study Lounge',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=100&w=2560&auto=format&fit=crop',
  },
  {
    id: 'cyber_matrix',
    label: 'Cyber Grid & Hologram',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=100&w=2560&auto=format&fit=crop',
  },
  {
    id: 'minimal_dark',
    label: 'Obsidiana Dark Minimal',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=100&w=2560&auto=format&fit=crop',
  },
]

const PRESET_AVATARS = [
  MASCOT_IMAGE,
  'https://api.dicebear.com/7.x/bottts/svg?seed=student1',
  'https://api.dicebear.com/7.x/bottts/svg?seed=student2',
  'https://api.dicebear.com/7.x/bottts/svg?seed=coder3',
  'https://api.dicebear.com/7.x/bottts/svg?seed=engineer4',
  'https://api.dicebear.com/7.x/bottts/svg?seed=science5',
]

const BANNER_HEIGHTS: Record<BannerHeightMode, { label: string; className: string }> = {
  compact: { label: 'Compacta', className: 'h-64 sm:h-72' },
  normal: { label: 'Normal', className: 'h-80 sm:h-96' },
  cinematic: { label: 'Cinemática', className: 'h-96 sm:h-[480px]' },
  tall: { label: 'Grande', className: 'h-[440px] sm:h-[580px]' },
}

export const ProfileView: React.FC = () => {
  const { user, subjects, notes, tasks, activePeriod, updateProfile, updatePassword, exportData } = useApp()

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [career, setCareer] = useState(user?.career || '')
  const [university, setUniversity] = useState(user?.university || '')
  const [studentId, setStudentId] = useState(user?.studentId || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [avatar, setAvatar] = useState(user?.avatar || PRESET_AVATARS[0])
  const [banner, setBanner] = useState(user?.banner || PRESET_BANNERS[0].url)

  // Password management state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  // Banner display parameters
  const [bannerFit, setBannerFit] = useState<BannerFitMode>(user?.bannerFit || 'cover')
  const [bannerOffsetY, setBannerOffsetY] = useState<number>(user?.bannerOffsetY ?? 50)
  const [bannerOffsetX, setBannerOffsetX] = useState<number>(user?.bannerOffsetX ?? 50)
  const [bannerZoom, setBannerZoom] = useState<number>(user?.bannerZoom ?? 1)
  const [bannerHeight, setBannerHeight] = useState<BannerHeightMode>(user?.bannerHeight || 'normal')

  // In-place repositioning mode
  const [isRepositioning, setIsRepositioning] = useState(false)
  const [tempBannerFit, setTempBannerFit] = useState<BannerFitMode>('cover')
  const [tempOffsetY, setTempOffsetY] = useState(50)
  const [tempOffsetX, setTempOffsetX] = useState(50)
  const [tempZoom, setTempZoom] = useState(1)
  const [tempHeight, setTempHeight] = useState<BannerHeightMode>('normal')

  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false)
  const [cropperSrc, setCropperSrc] = useState<string | null>(null)
  const [cropperTarget, setCropperTarget] = useState<'avatar' | 'banner'>('banner')
  const [cropperAspect, setCropperAspect] = useState<CropAspectRatio>('3:1')

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)
  const bannerContainerRef = useRef<HTMLDivElement>(null)

  // Drag state for in-place banner reposition
  const [isDraggingBanner, setIsDraggingBanner] = useState(false)
  const dragStart = useRef({ x: 0, y: 0, ox: 50, oy: 50 })

  // Real-time synchronization when user loads
  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
      setCareer(user.career || '')
      setUniversity(user.university || '')
      setStudentId(user.studentId || '')
      setBio(user.bio || '')
      setAvatar(user.avatar || PRESET_AVATARS[0])
      setBanner(user.banner || PRESET_BANNERS[0].url)
      setBannerFit(user.bannerFit || 'cover')
      setBannerOffsetY(user.bannerOffsetY ?? 50)
      setBannerOffsetX(user.bannerOffsetX ?? 50)
      setBannerZoom(user.bannerZoom ?? 1)
      setBannerHeight(user.bannerHeight || 'normal')
    }
  }, [user])

  // Metrics
  const completedTasks = tasks.filter((t) => t.isCompleted).length
  const pendingTasks = tasks.filter((t) => !t.isCompleted).length

  // Avatar Upload → opens cropper
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 8 * 1024 * 1024) {
      alerts.error('Imagen muy grande', 'Elige una foto de máximo 8 MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        openCropStudioForAvatar(event.target.result)
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // Banner Upload → enter in-place reposition mode directly
  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 15 * 1024 * 1024) {
      alerts.error('Imagen muy grande', 'Elige un banner de máximo 15 MB')
      return
    }
    const reader = new FileReader()
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        const newBannerSrc = event.target.result
        setBanner(newBannerSrc)
        setIsBannerModalOpen(false)
        startRepositioning(newBannerSrc)
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // Open cropping studio for banner
  const openCropStudioForBanner = (imageSrcToCrop?: string) => {
    setCropperSrc(imageSrcToCrop || banner)
    setCropperTarget('banner')
    setCropperAspect('3:1')
    setIsBannerModalOpen(false)
  }

  // Open cropping studio for avatar
  const openCropStudioForAvatar = (imageSrcToCrop?: string) => {
    setCropperSrc(imageSrcToCrop || avatar)
    setCropperTarget('avatar')
    setCropperAspect('circle')
  }

  // Start in-place repositioning
  const startRepositioning = (overrideBannerSrc?: string) => {
    setTempBannerFit(bannerFit)
    setTempOffsetY(bannerOffsetY)
    setTempOffsetX(bannerOffsetX)
    setTempZoom(bannerZoom)
    setTempHeight(bannerHeight)
    setIsRepositioning(true)
    setIsBannerModalOpen(false)
  }

  // Confirm in-place repositioning
  const saveRepositioning = () => {
    setBannerFit(tempBannerFit)
    setBannerOffsetY(tempOffsetY)
    setBannerOffsetX(tempOffsetX)
    setBannerZoom(tempZoom)
    setBannerHeight(tempHeight)
    setIsRepositioning(false)

    updateProfile({
      banner,
      bannerFit: tempBannerFit,
      bannerOffsetY: tempOffsetY,
      bannerOffsetX: tempOffsetX,
      bannerZoom: tempZoom,
      bannerHeight: tempHeight,
    })
    alerts.success('Portada actualizada', 'Se guardó tu posición y modo de visualización')
  }

  // Cancel in-place repositioning
  const cancelRepositioning = () => {
    setIsRepositioning(false)
  }

  // Drag handlers for in-place banner
  const handleBannerPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!isRepositioning || tempBannerFit === 'contain') return
      e.preventDefault()
      setIsDraggingBanner(true)
      dragStart.current = { x: e.clientX, y: e.clientY, ox: tempOffsetX, oy: tempOffsetY }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [isRepositioning, tempBannerFit, tempOffsetX, tempOffsetY]
  )

  const handleBannerPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingBanner || !bannerContainerRef.current) return
      const rect = bannerContainerRef.current.getBoundingClientRect()
      const dx = e.clientX - dragStart.current.x
      const dy = e.clientY - dragStart.current.y

      // Sensitivity: drag down -> image moves down -> lower offsetY percentage
      const sensitivityX = (100 / rect.width) * 0.8
      const sensitivityY = (100 / rect.height) * 0.8

      const newOx = Math.max(0, Math.min(100, dragStart.current.ox - dx * sensitivityX))
      const newOy = Math.max(0, Math.min(100, dragStart.current.oy - dy * sensitivityY))

      setTempOffsetX(newOx)
      setTempOffsetY(newOy)
    },
    [isDraggingBanner]
  )

  const handleBannerPointerUp = useCallback(() => {
    setIsDraggingBanner(false)
  }, [])

  // Crop confirm (Avatar or Banner)
  const handleCropConfirm = (croppedDataUrl: string) => {
    if (cropperTarget === 'avatar') {
      setAvatar(croppedDataUrl)
      updateProfile({ avatar: croppedDataUrl })
      alerts.success('Foto de perfil actualizada', 'Se recortó y guardó tu foto')
    } else {
      setBanner(croppedDataUrl)
      updateProfile({ banner: croppedDataUrl })
      alerts.success('Portada recortada', 'Se aplicó el nuevo recorte a tu portada')
    }
    setCropperSrc(null)
  }

  const handleSelectPresetBanner = (presetUrl: string) => {
    setBanner(presetUrl)
    setIsBannerModalOpen(false)
    startRepositioning(presetUrl)
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      career: career.trim(),
      university: university.trim(),
      studentId: studentId.trim(),
      bio: bio.trim(),
      avatar,
      banner,
      bannerFit,
      bannerOffsetY,
      bannerOffsetX,
      bannerZoom,
      bannerHeight,
    })
    alerts.success('Perfil guardado', 'Tus datos se actualizaron correctamente')
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword.trim()) {
      alerts.error('Error', 'Por favor ingresa una contraseña.')
      return
    }
    if (newPassword.length < 4) {
      alerts.error('Contraseña muy corta', 'La contraseña debe tener al menos 4 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      alerts.error('No coinciden', 'Las contraseñas no coinciden. Verifica e intenta de nuevo.')
      return
    }

    setIsUpdatingPassword(true)
    const success = updatePassword(newPassword)
    setIsUpdatingPassword(false)

    if (success) {
      alerts.success('¡Contraseña actualizada!', 'Tu nueva contraseña ha sido guardada en tu dispositivo.')
      setNewPassword('')
      setConfirmPassword('')
    } else {
      alerts.error('Error', 'No se pudo actualizar la contraseña.')
    }
  }

  // Active values (either temp in edit mode or saved)
  const activeFit = isRepositioning ? tempBannerFit : bannerFit
  const activeHeight = isRepositioning ? tempHeight : bannerHeight
  const activeOffsetY = isRepositioning ? tempOffsetY : bannerOffsetY
  const activeOffsetX = isRepositioning ? tempOffsetX : bannerOffsetX
  const activeZoom = isRepositioning ? tempZoom : bannerZoom

  return (
    <div className="relative flex-1 overflow-y-auto bg-[#030306] text-white w-full h-full">
      <MinimalBackground />

      <div className="relative z-10 w-full flex flex-col">
        {/* ═══════════════ FULL-WIDTH HERO COVER BANNER ═══════════════ */}
        <div
          ref={bannerContainerRef}
          className={`relative w-full ${BANNER_HEIGHTS[activeHeight].className} bg-slate-950 overflow-hidden group select-none transition-all duration-300 ${
            isRepositioning && activeFit === 'cover' ? 'cursor-grab active:cursor-grabbing ring-2 ring-indigo-500' : ''
          }`}
          onPointerDown={handleBannerPointerDown}
          onPointerMove={handleBannerPointerMove}
          onPointerUp={handleBannerPointerUp}
        >
          {/* Contain mode background blur glow */}
          {activeFit === 'contain' && (
            <div
              className="absolute inset-0 scale-125 filter blur-3xl opacity-50 pointer-events-none"
              style={{
                backgroundImage: `url(${banner})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
              }}
            />
          )}

          {/* Main Banner Image */}
          <img
            src={banner}
            alt="Cover Banner"
            draggable={false}
            className={`w-full h-full transition-transform duration-150 transform-gpu ${
              activeFit === 'contain'
                ? 'object-contain relative z-10'
                : 'object-cover pointer-events-none'
            }`}
            style={{
              objectPosition: activeFit === 'cover' ? `${activeOffsetX}% ${activeOffsetY}%` : 'center',
              transform: activeFit === 'cover' ? `scale(${activeZoom})` : 'none',
              transformOrigin: `${activeOffsetX}% ${activeOffsetY}%`,
              imageRendering: '-webkit-optimize-contrast',
            }}
            loading="eager"
            decoding="async"
          />

          {/* Fade gradient at bottom edge */}
          <div className="absolute inset-0 bg-linear-to-t from-[#030306] from-0% via-[#030306]/40 via-15% to-transparent to-50% pointer-events-none z-10" />

          {/* ─── NORMAL MODE: Change / Reposition Buttons ─── */}
          {!isRepositioning && (
            <div className="absolute top-6 right-6 sm:right-10 md:right-14 z-20 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => openCropStudioForBanner()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold border border-white/10 transition cursor-pointer shadow-lg hover:scale-105"
                title="Recortar imagen con recuadro interactivo"
              >
                <Crop className="w-3.5 h-3.5 text-purple-400" />
                <span>Recortar</span>
              </button>
              <button
                type="button"
                onClick={() => startRepositioning()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white text-xs font-semibold border border-white/10 transition cursor-pointer shadow-lg hover:scale-105"
                title="Ajustar posición y encuadre"
              >
                <Move className="w-3.5 h-3.5 text-indigo-400" />
                <span>Ajustar Encuadre</span>
              </button>
              <ShimmerButton
                type="button"
                variant="glass"
                size="sm"
                onClick={() => setIsBannerModalOpen(true)}
                icon={<ImageIcon className="w-3.5 h-3.5 text-[var(--theme-accent,#c084fc)]" />}
              >
                Cambiar Portada
              </ShimmerButton>
            </div>
          )}

          {/* ─── REPOSITIONING CONTROL BAR (FACEBOOK STYLE) ─── */}
          {isRepositioning && (
            <div className="absolute top-4 left-4 right-4 sm:left-8 sm:right-8 z-30 flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950/90 backdrop-blur-xl border border-indigo-500/50 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
              <div className="flex flex-wrap items-center gap-2">
                {/* Fit Mode Toggle */}
                <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-0.5">
                  <button
                    type="button"
                    onClick={() => setTempBannerFit('cover')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      tempBannerFit === 'cover'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    Llenar y Mover
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempBannerFit('contain')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      tempBannerFit === 'contain'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Ver Completa
                  </button>
                </div>

                {/* Banner Height Selector */}
                <div className="hidden sm:flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-0.5">
                  {(['compact', 'normal', 'cinematic', 'tall'] as BannerHeightMode[]).map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setTempHeight(h)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                        tempHeight === h
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {BANNER_HEIGHTS[h].label}
                    </button>
                  ))}
                </div>

                {/* Crop Studio Button */}
                <button
                  type="button"
                  onClick={() => openCropStudioForBanner()}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 border border-slate-700/80 text-purple-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
                  title="Abrir estudio de recorte libre"
                >
                  <Crop className="w-3.5 h-3.5 text-purple-400" />
                  Recortar
                </button>

                {/* Zoom Slider (in Cover mode) */}
                {tempBannerFit === 'cover' && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-slate-900/80 border border-slate-700/60 rounded-xl">
                    <ZoomIn className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="range"
                      min={1}
                      max={2.5}
                      step={0.05}
                      value={tempZoom}
                      onChange={(e) => setTempZoom(parseFloat(e.target.value))}
                      className="w-20 accent-indigo-500 h-1.5 bg-slate-700 rounded-full cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-400 font-mono w-8">
                      {Math.round(tempZoom * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={cancelRepositioning}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={saveRepositioning}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-950/50 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Guardar Posición
                </button>
              </div>
            </div>
          )}

          {/* Drag instruction overlay in edit mode */}
          {isRepositioning && tempBannerFit === 'cover' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div className="px-4 py-2 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-xs text-white font-medium flex items-center gap-2 shadow-2xl animate-pulse">
                <Move className="w-4 h-4 text-indigo-400" />
                <span>Arrastra hacia arriba o abajo para encuadrar la portada</span>
              </div>
            </div>
          )}
        </div>

        {/* ═══════════════ PROFILE HEADER & USER IDENTITY ═══════════════ */}
        <div className="px-6 sm:px-10 md:px-14 lg:px-16 pb-8 pt-0 relative border-b border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-20 sm:-mt-24 mb-5">
            {/* Overlapping Avatar with Edit Button */}
            <div className="relative group shrink-0 z-20">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-[#030306] border-4 border-[#030306] shadow-2xl shadow-black/80 overflow-hidden flex items-center justify-center ring-2 ring-[var(--theme-border,rgba(147,51,234,0.3))]">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-slate-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="absolute bottom-1 right-1 p-2.5 rounded-2xl bg-[var(--theme-primary,#9333ea)] hover:opacity-90 text-white shadow-xl transition cursor-pointer border-2 border-[#030306]"
                title="Cambiar foto de perfil"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3.5">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                {name || 'Usuario'}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--theme-badge-bg,rgba(147,51,234,0.15))] border border-[var(--theme-border,rgba(147,51,234,0.3))] text-[var(--theme-badge-text,#c084fc)] text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-[var(--theme-accent,#c084fc)]" />
                  <span>{activePeriod?.name || 'Periodo Activo'}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cuenta Activa</span>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-xs sm:text-sm text-slate-300">
              <span className="flex items-center gap-2 text-[var(--theme-badge-text,#c084fc)] font-semibold">
                <GraduationCap className="w-4 h-4" /> {career || 'Sin carrera asignada'}
              </span>
              <span className="flex items-center gap-2 text-slate-400">
                <School className="w-4 h-4" /> {university || 'Sin universidad asignada'}
              </span>
              <span className="flex items-center gap-2 text-slate-400">
                <IdCard className="w-4 h-4" /> {studentId ? `Matrícula: ${studentId}` : 'Sin matrícula'}
              </span>
            </div>

            {bio ? (
              <p className="text-xs sm:text-sm text-slate-400 pt-1 max-w-4xl leading-relaxed">
                {bio}
              </p>
            ) : (
              <p className="text-xs text-slate-500 pt-1 italic">
                Añade una descripción o biografía sobre tus metas académicas abajo.
              </p>
            )}
          </div>
        </div>

        {/* ═══════════════ MAIN FORM & METRICS ═══════════════ */}
        <div className="px-6 sm:px-10 md:px-14 lg:px-16 py-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <div className="border-l-4 border-[var(--theme-primary,#9333ea)] pl-4">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
                <User className="w-5 h-5 text-[var(--theme-accent,#c084fc)]" />
                <span>Editar Información Personal</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Actualiza tus datos para sincronizarlos en tu base de datos y computadoras
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-8">
              {/* Contact Data */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--theme-accent,#c084fc)] uppercase tracking-wider">
                  <Mail className="w-4 h-4" />
                  <span>Datos de contacto</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0a0a14] rounded-xl text-white placeholder-slate-500 border border-white/10 focus:border-[var(--theme-border-hover,rgba(147,51,234,0.8))] focus:ring-1 focus:ring-[var(--theme-primary,#9333ea)] focus:outline-hidden text-xs sm:text-sm transition shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Correo institucional / personal *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0a0a14] rounded-xl text-white placeholder-slate-500 border border-white/10 focus:border-[var(--theme-border-hover,rgba(147,51,234,0.8))] focus:ring-1 focus:ring-[var(--theme-primary,#9333ea)] focus:outline-hidden text-xs sm:text-sm transition shadow-inner"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Data */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[var(--theme-accent,#c084fc)] uppercase tracking-wider">
                  <GraduationCap className="w-4 h-4" />
                  <span>Datos académicos</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Carrera / Especialidad
                    </label>
                    <input
                      type="text"
                      value={career}
                      onChange={(e) => setCareer(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0a0a14] rounded-xl text-white placeholder-slate-500 border border-white/10 focus:border-[var(--theme-border-hover,rgba(147,51,234,0.8))] focus:ring-1 focus:ring-[var(--theme-primary,#9333ea)] focus:outline-hidden text-xs sm:text-sm transition shadow-inner"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Universidad / Instituto
                    </label>
                    <input
                      type="text"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0a0a14] rounded-xl text-white placeholder-slate-500 border border-white/10 focus:border-[var(--theme-border-hover,rgba(147,51,234,0.8))] focus:ring-1 focus:ring-[var(--theme-primary,#9333ea)] focus:outline-hidden text-xs sm:text-sm transition shadow-inner"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-300 mb-2">
                      Matrícula / ID
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full px-4 py-3 bg-[#0a0a14] rounded-xl text-white placeholder-slate-500 border border-white/10 focus:border-[var(--theme-border-hover,rgba(147,51,234,0.8))] focus:ring-1 focus:ring-[var(--theme-primary,#9333ea)] focus:outline-hidden text-xs sm:text-sm transition shadow-inner"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <FileText className="w-4 h-4" />
                  <span>Biografía y presentación</span>
                </div>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Escribe un breve resumen de tus estudios o intereses..."
                  className="w-full px-4 py-3 bg-[#0a0a14] rounded-xl text-white placeholder-slate-500 border border-white/10 focus:border-[var(--theme-border-hover,rgba(147,51,234,0.8))] focus:ring-1 focus:ring-[var(--theme-primary,#9333ea)] focus:outline-hidden text-xs sm:text-sm resize-none transition shadow-inner leading-relaxed"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <ClickSpark sparkColor="var(--theme-primary, #c084fc)" sparkCount={10}>
                  <ShimmerButton
                    type="submit"
                    variant="primary"
                    size="md"
                    icon={<Save className="w-4 h-4" />}
                  >
                    Guardar Cambios
                  </ShimmerButton>
                </ClickSpark>
              </div>
            </form>

            {/* ═══════════════ SECURITY & PASSWORD SECTION ═══════════════ */}
            <div className="pt-8 border-t border-white/5 space-y-6">
              <div className="border-l-4 border-emerald-500 pl-4">
                <h2 className="text-xl font-extrabold text-white flex items-center gap-2.5">
                  <Lock className="w-5 h-5 text-emerald-400" />
                  <span>Seguridad y Contraseña</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Establece o cambia la contraseña local de tu cuenta para iniciar sesión en este dispositivo.
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4 bg-black/40 border border-white/5 p-6 rounded-2xl shadow-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-emerald-400" /> Nueva Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Mínimo 4 caracteres"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2.5 bg-[#0a0a14] rounded-xl text-white placeholder-slate-500 border border-white/10 focus:border-emerald-500 focus:outline-hidden text-xs pr-10 transition"
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

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-emerald-400" /> Confirmar Contraseña
                    </label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Repite la contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-[#0a0a14] rounded-xl text-white placeholder-slate-500 border border-white/10 focus:border-emerald-500 focus:outline-hidden text-xs transition"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <ClickSpark sparkColor="#10b981" sparkCount={8}>
                    <button
                      type="submit"
                      disabled={isUpdatingPassword}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{isUpdatingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}</span>
                    </button>
                  </ClickSpark>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar Metrics */}
          <div className="lg:col-span-4 space-y-10 lg:border-l lg:border-white/5 lg:pl-10">
            <div className="space-y-5">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-[var(--theme-accent,#c084fc)]" />
                <span>Rendimiento Académico</span>
              </h3>

              <div className="grid grid-cols-2 gap-y-6 gap-x-6 pt-2">
                <div className="flex flex-col space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>Materias</span>
                  </div>
                  <div className="text-4xl font-extrabold text-white tracking-tight">
                    {subjects.length}
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <span>Apuntes</span>
                  </div>
                  <div className="text-4xl font-extrabold text-white tracking-tight">
                    {notes.length}
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Completadas</span>
                  </div>
                  <div className="text-4xl font-extrabold text-emerald-400 tracking-tight">
                    {completedTasks}
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <span>Pendientes</span>
                  </div>
                  <div className="text-4xl font-extrabold text-amber-400 tracking-tight">
                    {pendingTasks}
                  </div>
                </div>
              </div>
            </div>

            {/* Backup & Tools */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-[var(--theme-accent,#c084fc)]" />
                <span>Copia de Seguridad</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Descarga un respaldo JSON con todas tus materias, apuntes y fotos para migrar entre computadoras.
              </p>
              <ShimmerButton
                type="button"
                variant="secondary"
                size="md"
                className="w-full"
                onClick={exportData}
                icon={<Download className="w-4 h-4 text-[var(--theme-accent,#c084fc)]" />}
              >
                Exportar Respaldo Completo
              </ShimmerButton>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════ CHANGE BANNER MODAL ═══════════════ */}
      {isBannerModalOpen && (
        <div
          onClick={() => setIsBannerModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-[#0c0c16] rounded-3xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[85vh] my-auto"
          >
            {/* Modal Header */}
            <div className="p-5 bg-black/30 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Cambiar Portada</h3>
                  <p className="text-[11px] text-slate-400">Sube tu propio fondo o elige uno predeterminado</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBannerModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              {/* Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Upload Box */}
                <div
                  onClick={() => bannerInputRef.current?.click()}
                  className="group p-5 rounded-2xl border-2 border-dashed border-purple-500/40 hover:border-purple-500 bg-purple-500/5 hover:bg-purple-500/10 transition cursor-pointer flex flex-col items-center justify-center text-center space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 group-hover:scale-110 transition-transform">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-purple-300 transition">
                      Subir Imagen / GIF
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      PNG, JPG, WEBP, GIF hasta 15 MB
                    </p>
                  </div>
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handleBannerUpload}
                    className="hidden"
                  />
                </div>

                {/* Crop Current Banner Box */}
                <div
                  onClick={() => openCropStudioForBanner()}
                  className="group p-5 rounded-2xl border-2 border-dashed border-indigo-500/40 hover:border-indigo-500 bg-indigo-500/5 hover:bg-indigo-500/10 transition cursor-pointer flex flex-col items-center justify-center text-center space-y-2"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-110 transition-transform">
                    <Crop className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition">
                      Estudio de Recorte
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Recortar área personalizada
                    </p>
                  </div>
                </div>
              </div>

              {/* Presets Gallery */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Portadas Predeterminadas del Sistema
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PRESET_BANNERS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPresetBanner(p.url)}
                      className={`group relative h-28 rounded-2xl overflow-hidden border transition text-left cursor-pointer shadow-md hover:shadow-xl hover:scale-[1.02] ${
                        banner === p.url
                          ? 'border-purple-500 ring-2 ring-purple-500/50'
                          : 'border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <img
                        src={p.url}
                        alt={p.label}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                        <span className="text-xs font-bold text-white group-hover:text-purple-200 transition">
                          {p.label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ INTERACTIVE CROP STUDIO MODAL ═══════════════ */}
      {cropperSrc && (
        <ImageCropper
          imageSrc={cropperSrc}
          initialAspect={cropperAspect}
          shape={cropperTarget === 'avatar' ? 'circle' : 'rect'}
          onConfirm={handleCropConfirm}
          onCancel={() => setCropperSrc(null)}
        />
      )}
    </div>
  )
}
