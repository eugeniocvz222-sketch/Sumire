import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  AppData,
  AppSettings,
  Note,
  Subject,
  Task,
  AcademicPeriod,
  SubjectGrade,
  PeriodType,
  UserProfile,
  SystemTheme,
  NoteVersion,
} from '../types'
import { StorageService } from '../lib/storage'
import { initialAppData } from '../lib/initialData'
import confetti from 'canvas-confetti'
import { alerts } from '../lib/alerts'
import { dbClient } from '../lib/dbClient'
import { applyThemeVariables } from '../components/common/ThemeConfig'
import { MASCOT_IMAGE } from '../lib/mascot'

interface AppContextType {
  // Auth & Profile
  user: UserProfile | null
  isAuthenticated: boolean
  login: (email: string, name?: string) => void
  register: (userData: Omit<UserProfile, 'id' | 'createdAt'>) => void
  loginWithPassword: (email: string, password: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>
  registerWithPassword: (
    userData: { name: string; email: string; career?: string; university?: string; avatar?: string },
    password: string
  ) => Promise<{ success: boolean; user?: UserProfile; error?: string }>
  updateProfile: (updates: Partial<UserProfile>) => void
  logout: () => void
  // Navigation & View
  periods: AcademicPeriod[]
  subjects: Subject[]
  notes: Note[]
  tasks: Task[]
  grades: SubjectGrade[]
  settings: AppSettings
  systemTheme: SystemTheme
  setSystemTheme: (theme: SystemTheme) => void
  activeView: 'shelf' | 'subject' | 'tasks' | 'schedule' | 'grades' | 'profile'
  activePeriodId: string
  activePeriod: AcademicPeriod | null
  activeSubjectId: string | null
  activeNoteId: string | null
  selectedSemester: string
  searchQuery: string
  isSyncing: boolean
  syncMessage: string
  activeSubject: Subject | null
  activeNote: Note | null
  filteredSubjects: Subject[]
  periodTasks: Task[]
  setActiveView: (view: 'shelf' | 'subject' | 'tasks' | 'schedule' | 'grades' | 'profile') => void
  setActivePeriodId: (id: string) => void
  setActiveSubjectId: (id: string | null) => void
  setActiveNoteId: (id: string | null) => void
  setSelectedSemester: (sem: string) => void
  setSearchQuery: (query: string) => void
  // Period CRUD
  createPeriod: (params: { name: string; type: PeriodType; dateRange: string; isCurrent?: boolean }) => AcademicPeriod
  updatePeriod: (id: string, updates: Partial<AcademicPeriod>) => void
  deletePeriod: (id: string) => void
  // Subject CRUD
  createSubject: (subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt' | 'units'> & { initialUnits?: string[] }) => Subject
  updateSubject: (id: string, updates: Partial<Subject>) => void
  deleteSubject: (id: string) => void
  // Note CRUD
  createNote: (subjectId: string, unit?: string, title?: string) => Note
  updateNote: (id: string, updates: Partial<Note>) => void
  deleteNote: (id: string) => void
  toggleFavoriteNote: (id: string) => void
  exportNoteMarkdown: (noteId: string) => Promise<boolean>
  saveNoteVersion: (noteId: string, label?: string) => void
  restoreNoteVersion: (noteId: string, versionId: string) => void
  // Task CRUD
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isCompleted'>) => Task
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void
  // Grades CRUD
  updateGrade: (subjectId: string, updates: Partial<SubjectGrade>) => void
  // Settings & Sync
  updateSettings: (updates: Partial<AppSettings>) => void
  triggerCloudSync: () => Promise<void>
  chooseCustomFolder: () => Promise<string | null>
  importData: (file: File) => Promise<boolean>
  exportData: () => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

function sanitizeData(appData: AppData): AppData {
  if (!appData) return appData
  const validSubjects = (appData.subjects || []).filter(
    (s) => !['sub-1', 'sub-2', 'sub-3', 'sub-4'].includes(s.id)
  )
  const validSubjectIds = new Set(validSubjects.map((s) => s.id))

  const cleanNotes = (appData.notes || []).filter(
    (n) => validSubjectIds.has(n.subjectId) && !['note-1', 'note-2', 'note-3'].includes(n.id)
  )
  const cleanTasks = (appData.tasks || []).filter(
    (t) => validSubjectIds.has(t.subjectId) && !['task-1', 'task-2', 'task-3'].includes(t.id)
  )
  const cleanGrades = (appData.grades || []).filter((g) => validSubjectIds.has(g.subjectId))

  return {
    ...appData,
    subjects: validSubjects,
    notes: cleanNotes,
    tasks: cleanTasks,
    grades: cleanGrades,
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(initialAppData)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [activeView, setActiveView] = useState<'shelf' | 'subject' | 'tasks' | 'schedule' | 'grades' | 'profile'>('shelf')
  const [activePeriodId, setActivePeriodId] = useState<string>('period-1')
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null)
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [selectedSemester, setSelectedSemester] = useState<string>('7mo Cuatrimestre')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isSyncing, setIsSyncing] = useState<boolean>(false)
  const [syncMessage, setSyncMessage] = useState<string>('Modo Local (100% Offline)')

  // Auto-persist changes locally via StorageService
  const persist = useCallback((newData: AppData) => {
    const clean = sanitizeData(newData)
    setData(clean)
    StorageService.saveData(clean, clean.user?.id)
  }, [])

  // Load data on startup
  useEffect(() => {
    async function init() {
      // 1. Check if an active user session exists
      const savedUserId = localStorage.getItem('apuntes_active_user_id')
      if (savedUserId) {
        const loaded = await StorageService.loadData(savedUserId)
        if (loaded && loaded.user) {
          const clean = sanitizeData(loaded)
          setData(clean)
          setIsAuthenticated(true)
          const currentPeriod = clean.periods?.find((p) => p.isCurrent) || clean.periods?.[0]
          if (currentPeriod) {
            setActivePeriodId(currentPeriod.id)
            setSelectedSemester(currentPeriod.name)
          }
          return
        }
      }

      // 2. Fallback to clean local storage
      const loaded = await StorageService.loadData(null)
      const clean = sanitizeData(loaded)
      setData(clean)
      if (clean.user) {
        setIsAuthenticated(true)
      } else {
        setIsAuthenticated(false)
      }
    }
    init()
  }, [])

  // Auth Actions with Bcrypt and StorageService (100% Plug & Play Offline)
  const loginWithPassword = async (email: string, password: string) => {
    setIsSyncing(true)
    setSyncMessage('Autenticando...')
    try {
      const res = await StorageService.loginLocalUser(email, password)
      if (res.success && res.user) {
        localStorage.setItem('apuntes_active_user_id', res.user.id)
        const userData = await StorageService.loadData(res.user.id)
        if (userData && userData.user) {
          const clean = sanitizeData(userData)
          setData(clean)
          StorageService.saveData(clean, res.user.id)
          const currentPeriod = clean.periods?.find((p) => p.isCurrent) || clean.periods?.[0]
          if (currentPeriod) {
            setActivePeriodId(currentPeriod.id)
            setSelectedSemester(currentPeriod.name)
          }
        }
        setIsAuthenticated(true)
        setSyncMessage('Modo Local (100% Offline)')
        return { success: true, user: res.user }
      }
      return { success: false, error: res.error || 'Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.' }
    } catch (e: any) {
      return { success: false, error: e.message || 'Error al iniciar sesión' }
    } finally {
      setIsSyncing(false)
    }
  }

  const registerWithPassword = async (
    userData: { name: string; email: string; career?: string; university?: string; avatar?: string },
    password: string
  ) => {
    setIsSyncing(true)
    setSyncMessage('Creando cuenta local...')
    try {
      const res = await StorageService.registerLocalUser(userData, password)
      if (res.success && res.user) {
        localStorage.setItem('apuntes_active_user_id', res.user.id)
        const freshLoaded = await StorageService.loadData(res.user.id)
        const clean = sanitizeData(freshLoaded)
        setData(clean)
        setIsAuthenticated(true)
        setSyncMessage('Modo Local (100% Offline)')
        return { success: true, user: res.user }
      }
      return { success: false, error: res.error || 'No se pudo crear la cuenta' }
    } catch (e: any) {
      return { success: false, error: e.message || 'Error al crear la cuenta' }
    } finally {
      setIsSyncing(false)
    }
  }

  const login = (email: string, name?: string) => {
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name: name || email.split('@')[0] || 'Estudiante',
      email,
      career: '',
      university: '',
      avatar: MASCOT_IMAGE,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem('apuntes_active_user_id', newUser.id)
    const freshData: AppData = {
      user: newUser,
      periods: [
        {
          id: `period-${Date.now()}`,
          name: '7mo Cuatrimestre',
          type: 'cuatrimestre',
          dateRange: 'Septiembre - Diciembre 2026',
          isCurrent: true,
          createdAt: new Date().toISOString(),
        },
      ],
      subjects: [],
      notes: [],
      tasks: [],
      grades: [],
      settings: {
        activeSemester: '7mo Cuatrimestre',
        theme: 'dark',
        systemTheme: 'purple',
        storagePath: 'Local / Sincronizado',
        cloudSyncEnabled: true,
      },
    }
    setData(freshData)
    StorageService.saveData(freshData, newUser.id)
    setIsAuthenticated(true)
  }

  const register = (userData: Omit<UserProfile, 'id' | 'createdAt'>) => {
    const newUser: UserProfile = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem('apuntes_active_user_id', newUser.id)
    const updated = { ...data, user: newUser }
    persist(updated)
    setIsAuthenticated(true)
  }

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!data.user) return
    const updatedUser = { ...data.user, ...updates }
    const updated = { ...data, user: updatedUser }
    persist(updated)
    StorageService.updateLocalUserProfile(updatedUser.id, updates)
  }

  const logout = () => {
    localStorage.removeItem('apuntes_active_user_id')
    setIsAuthenticated(false)
    setData(initialAppData)
    setActiveView('shelf')
    alerts.info('Sesión cerrada', 'Has cerrado sesión correctamente')
  }

  // Active Period
  const activePeriod = data.periods.find((p) => p.id === activePeriodId) || data.periods[0] || null

  // Active Subject & Note
  const activeSubject = data.subjects.find((s) => s.id === activeSubjectId) || null
  const activeNote = data.notes.find((n) => n.id === activeNoteId) || null

  // Filtered Subjects by Active Period & Search
  const filteredSubjects = data.subjects.filter((sub) => {
    const matchesPeriod =
      sub.periodId === activePeriodId ||
      sub.semester === activePeriod?.name ||
      selectedSemester === 'Todos' ||
      sub.semester === selectedSemester

    const matchesSearch =
      searchQuery.trim() === '' ||
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (sub.professor && sub.professor.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesPeriod && matchesSearch
  })

  // Filtered Tasks for Active Period
  const periodSubjectIds = filteredSubjects.map((s) => s.id)
  const periodTasks = data.tasks.filter((t) => periodSubjectIds.includes(t.subjectId))

  // Period Actions
  const createPeriod = (params: {
    name: string
    type: PeriodType
    dateRange: string
    isCurrent?: boolean
  }): AcademicPeriod => {
    const newPeriod: AcademicPeriod = {
      ...params,
      id: `period-${Date.now()}`,
      isCurrent: params.isCurrent ?? true,
      createdAt: new Date().toISOString(),
    }

    let updatedPeriods = [...data.periods]
    if (newPeriod.isCurrent) {
      updatedPeriods = updatedPeriods.map((p) => ({ ...p, isCurrent: false }))
    }
    updatedPeriods.push(newPeriod)

    const updated = {
      ...data,
      periods: updatedPeriods,
    }
    persist(updated)
    setActivePeriodId(newPeriod.id)
    setSelectedSemester(newPeriod.name)
    alerts.success('Periodo creado', `Se activó "${newPeriod.name}"`)
    return newPeriod
  }

  const updatePeriod = (id: string, updates: Partial<AcademicPeriod>) => {
    let updatedPeriods = data.periods.map((p) => (p.id === id ? { ...p, ...updates } : p))
    if (updates.isCurrent) {
      updatedPeriods = updatedPeriods.map((p) => (p.id === id ? p : { ...p, isCurrent: false }))
    }
    const updated = { ...data, periods: updatedPeriods }
    persist(updated)
  }

  const deletePeriod = (id: string) => {
    if (data.periods.length <= 1) {
      alert('Debes tener al menos un cuatrimestre/semestre activo.')
      return
    }
    const remainingPeriods = data.periods.filter((p) => p.id !== id)
    const nextPeriod = remainingPeriods[0]
    const updated = {
      ...data,
      periods: remainingPeriods,
    }
    persist(updated)
    setActivePeriodId(nextPeriod.id)
    setSelectedSemester(nextPeriod.name)
  }

  // Subject Actions
  const createSubject = (
    params: Omit<Subject, 'id' | 'createdAt' | 'updatedAt' | 'units'> & { initialUnits?: string[] }
  ): Subject => {
    const newSubject: Subject = {
      ...params,
      id: `sub-${Date.now()}`,
      periodId: activePeriodId,
      semester: activePeriod ? activePeriod.name : params.semester,
      units:
        params.initialUnits && params.initialUnits.length > 0
          ? params.initialUnits
          : ['Unidad 1', 'Unidad 2', 'Unidad 3'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const updated = {
      ...data,
      subjects: [newSubject, ...data.subjects],
    }
    persist(updated)
    alerts.success('Materia creada', `Libreta "${newSubject.name}" lista`)
    return newSubject
  }

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    const updated = {
      ...data,
      subjects: data.subjects.map((sub) =>
        sub.id === id ? { ...sub, ...updates, updatedAt: new Date().toISOString() } : sub
      ),
    }
    persist(updated)
    alerts.success('Materia actualizada')
  }

  const deleteSubject = (id: string) => {
    const updated = {
      ...data,
      subjects: data.subjects.filter((sub) => sub.id !== id),
      notes: data.notes.filter((n) => n.subjectId !== id),
      tasks: data.tasks.filter((t) => t.subjectId !== id),
    }
    if (activeSubjectId === id) {
      setActiveSubjectId(null)
      setActiveNoteId(null)
      setActiveView('shelf')
    }
    persist(updated)
  }

  // Note Actions
  const createNote = (subjectId: string, unit?: string, title?: string): Note => {
    const targetSubject = data.subjects.find((s) => s.id === subjectId)
    const targetUnit = unit || (targetSubject?.units[0] ?? 'General')
    const newNote: Note = {
      id: `note-${Date.now()}`,
      subjectId,
      unit: targetUnit,
      title: title || 'Nuevo Apunte sin título',
      content: '<h1>Nuevo Apunte</h1><p>Empieza a escribir tus notas de clase aquí...</p>',
      tags: [],
      isFavorite: false,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'local_only',
    }
    const updated = {
      ...data,
      notes: [newNote, ...data.notes],
    }
    persist(updated)
    setActiveNoteId(newNote.id)
    alerts.info('Nuevo apunte creado', 'Comienza a redactar')
    return newNote
  }

  const updateNote = (id: string, updates: Partial<Note>) => {
    const updated = {
      ...data,
      notes: data.notes.map((n) =>
        n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
      ),
    }
    persist(updated)
  }

  const deleteNote = (id: string) => {
    const updated = {
      ...data,
      notes: data.notes.filter((n) => n.id !== id),
    }
    if (activeNoteId === id) {
      setActiveNoteId(null)
    }
    persist(updated)
  }

  const toggleFavoriteNote = (id: string) => {
    const note = data.notes.find((n) => n.id === id)
    if (note) {
      updateNote(id, { isFavorite: !note.isFavorite })
    }
  }

  const exportNoteMarkdown = async (noteId: string): Promise<boolean> => {
    const note = data.notes.find((n) => n.id === noteId)
    const subject = data.subjects.find((s) => s.id === note?.subjectId)
    if (!note) return false

    const cleanContent = note.content
      .replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
      .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
      .replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n')
      .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<br\s*[\/]?>/gi, '\n')
      .replace(/<[^>]+>/g, '')

    return await StorageService.exportNoteAsMarkdown(note, subject?.name || 'General')
  }

  const countWords = (html: string) => {
    const text = html.replace(/<[^>]*>/g, ' ').trim()
    return text ? text.split(/\s+/).length : 0
  }

  const countChars = (html: string) => {
    return html.replace(/<[^>]*>/g, '').length
  }

  const saveNoteVersion = (noteId: string, label?: string) => {
    const note = data.notes.find((n) => n.id === noteId)
    if (!note) return

    const newVersion: NoteVersion = {
      id: `ver-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      noteId,
      title: note.title,
      content: note.content,
      summary: note.summary,
      createdAt: new Date().toISOString(),
      characterCount: countChars(note.content),
      wordCount: countWords(note.content),
      label: label || 'Punto de guardado',
    }

    const existingVersions = note.versions || []
    const updatedVersions = [newVersion, ...existingVersions].slice(0, 30)
    const updated = {
      ...data,
      notes: data.notes.map((n) => (n.id === noteId ? { ...n, versions: updatedVersions } : n)),
    }
    persist(updated)
    alerts.success('Versión guardada', label || 'Punto de restauración creado')
  }

  const restoreNoteVersion = (noteId: string, versionId: string) => {
    const note = data.notes.find((n) => n.id === noteId)
    if (!note) return

    const targetVersion = (note.versions || []).find((v) => v.id === versionId)
    if (!targetVersion) return

    // Save a backup checkpoint of current state before overwriting
    const currentBackup: NoteVersion = {
      id: `ver-${Date.now()}-backup`,
      noteId,
      title: note.title,
      content: note.content,
      summary: note.summary,
      createdAt: new Date().toISOString(),
      characterCount: countChars(note.content),
      wordCount: countWords(note.content),
      label: 'Copia previa a restauración',
    }

    const updatedVersions = [currentBackup, ...(note.versions || [])].slice(0, 30)

    const updated = {
      ...data,
      notes: data.notes.map((n) =>
        n.id === noteId
          ? {
              ...n,
              title: targetVersion.title,
              content: targetVersion.content,
              summary: targetVersion.summary,
              versions: updatedVersions,
              updatedAt: new Date().toISOString(),
            }
          : n
      ),
    }
    persist(updated)
  }

  // Task Actions
  const createTask = (
    taskParams: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isCompleted'>
  ): Task => {
    const newTask: Task = {
      ...taskParams,
      id: `task-${Date.now()}`,
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const updated = {
      ...data,
      tasks: [newTask, ...data.tasks],
    }
    persist(updated)
    alerts.success('Actividad registrada', `"${newTask.title}"`)
    return newTask
  }

  const toggleTask = (id: string) => {
    const task = data.tasks.find((t) => t.id === id)
    if (!task) return
    const isNowCompleted = !task.isCompleted

    if (isNowCompleted) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10b981', '#6366f1', '#f59e0b', '#ec4899'],
        })
      } catch (e) {
        // ignore confetti errors
      }
      alerts.success('¡Excelente trabajo!', `Completaste: "${task.title}"`)
    }

    const updated = {
      ...data,
      tasks: data.tasks.map((t) =>
        t.id === id
          ? { ...t, isCompleted: isNowCompleted, updatedAt: new Date().toISOString() }
          : t
      ),
    }
    persist(updated)
  }

  const deleteTask = (id: string) => {
    const updated = {
      ...data,
      tasks: data.tasks.filter((t) => t.id !== id),
    }
    persist(updated)
    alerts.info('Actividad eliminada')
  }

  // Grades Actions
  const updateGrade = (subjectId: string, updates: Partial<SubjectGrade>) => {
    const currentGrades = data.grades || []
    const existing = currentGrades.find((g) => g.subjectId === subjectId)
    let updatedGrades: SubjectGrade[]

    if (existing) {
      updatedGrades = currentGrades.map((g) =>
        g.subjectId === subjectId ? { ...g, ...updates } : g
      )
    } else {
      updatedGrades = [
        ...currentGrades,
        {
          subjectId,
          minPassingGrade: 7.0,
          ...updates,
        },
      ]
    }

    const updated = {
      ...data,
      grades: updatedGrades,
    }
    persist(updated)
  }

  // Settings Actions
  const updateSettings = (updates: Partial<AppSettings>) => {
    const updated = {
      ...data,
      settings: { ...data.settings, ...updates },
    }
    persist(updated)
  }

  const triggerCloudSync = async () => {
    setIsSyncing(true)
    setSyncMessage('Sincronizando con PostgreSQL y disco local...')
    try {
      if (data.user?.id) {
        await dbClient.saveUserData(data.user.id, data)
      }
      await StorageService.saveData(data)
      updateSettings({ lastSyncedAt: new Date().toISOString() })
      setSyncMessage('Sincronizado con éxito')
      alerts.success('Sincronización completada', 'Tus datos están al día')
    } catch (error: any) {
      setSyncMessage('Error de sincronización')
      alerts.error('Error de sincronización', error.message)
    } finally {
      setIsSyncing(false)
    }
  }

  const chooseCustomFolder = async (): Promise<string | null> => {
    const selected = await StorageService.selectCustomFolder()
    if (selected) {
      updateSettings({ storagePath: selected })
      return selected
    }
    return null
  }

  const importData = async (file: File): Promise<boolean> => {
    const imported = await StorageService.importBackup(file)
    if (imported) {
      persist(imported)
      return true
    }
    return false
  }

  const exportData = () => {
    StorageService.exportFullBackup(data)
  }

  const systemTheme: SystemTheme = data.settings?.systemTheme || 'purple'

  useEffect(() => {
    applyThemeVariables(systemTheme)
  }, [systemTheme])

  const setSystemTheme = useCallback((theme: SystemTheme) => {
    setData((prev) => {
      const updated = {
        ...prev,
        settings: {
          ...prev.settings,
          systemTheme: theme,
        },
      }
      StorageService.saveData(updated)
      if (prev.user?.id) {
        dbClient.saveUserData(prev.user.id, updated).catch(console.error)
      }
      return updated
    })
  }, [])

  return (
    <AppContext.Provider
      value={{
        user: data.user || null,
        isAuthenticated,
        login,
        register,
        loginWithPassword,
        registerWithPassword,
        updateProfile,
        logout,
        periods: data.periods,
        subjects: data.subjects,
        notes: data.notes,
        tasks: data.tasks,
        grades: data.grades || [],
        settings: data.settings,
        systemTheme,
        setSystemTheme,
        activeView,
        activePeriodId,
        activePeriod,
        activeSubjectId,
        activeNoteId,
        selectedSemester,
        searchQuery,
        isSyncing,
        syncMessage,
        activeSubject,
        activeNote,
        filteredSubjects,
        periodTasks,
        setActiveView,
        setActivePeriodId,
        setActiveSubjectId,
        setActiveNoteId,
        setSelectedSemester,
        setSearchQuery,
        createPeriod,
        updatePeriod,
        deletePeriod,
        createSubject,
        updateSubject,
        deleteSubject,
        createNote,
        updateNote,
        deleteNote,
        toggleFavoriteNote,
        exportNoteMarkdown,
        saveNoteVersion,
        restoreNoteVersion,
        createTask,
        toggleTask,
        deleteTask,
        updateGrade,
        updateSettings,
        triggerCloudSync,
        chooseCustomFolder,
        importData,
        exportData,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
