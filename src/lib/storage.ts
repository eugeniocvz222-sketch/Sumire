import bcrypt from 'bcryptjs'
import { AppData, Note, UserProfile } from '../types'
import { initialAppData } from './initialData'

const FILE_NAME = 'apuntes_data.json'
const USERS_INDEX_KEY = 'apuntes_local_users_v1'

export interface LocalUserRecord {
  id: string
  name: string
  email: string
  passwordHash: string
  career?: string
  university?: string
  studentId?: string
  bio?: string
  avatar?: string
  createdAt: string
}

function getStorageKey(userId?: string | null): string {
  if (userId) return `apuntes_universitarios_user_${userId}`
  return 'apuntes_universitarios_data_v1'
}

export class StorageService {
  /**
   * Get all registered local accounts
   */
  static getLocalUsers(): LocalUserRecord[] {
    try {
      const raw = localStorage.getItem(USERS_INDEX_KEY)
      if (raw) {
        return JSON.parse(raw) as LocalUserRecord[]
      }
    } catch (e) {
      console.error('Error reading local users index:', e)
    }
    return []
  }

  /**
   * Save local users index
   */
  static saveLocalUsers(users: LocalUserRecord[]): void {
    try {
      localStorage.setItem(USERS_INDEX_KEY, JSON.stringify(users))
    } catch (e) {
      console.error('Error saving local users index:', e)
    }
  }

  /**
   * Register a new user locally (Plug & Play, 100% offline with Bcrypt)
   */
  static async registerLocalUser(
    userData: { name: string; email: string; career?: string; university?: string; avatar?: string },
    plainPassword: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const users = this.getLocalUsers()
      const normalizedEmail = userData.email.trim().toLowerCase()

      const exists = users.find((u) => u.email.toLowerCase() === normalizedEmail)
      if (exists) {
        return { success: false, error: 'Ya existe una cuenta con este correo en tu dispositivo.' }
      }

      // Hash password locally with bcrypt
      const salt = bcrypt.genSaltSync(10)
      const passwordHash = bcrypt.hashSync(plainPassword, salt)
      const userId = `usr-${Date.now()}`

      const newUser: LocalUserRecord = {
        id: userId,
        name: userData.name.trim(),
        email: normalizedEmail,
        passwordHash,
        career: userData.career || 'Ingeniería en Tecnologías de la Información',
        university: userData.university || 'Universidad Tecnológica',
        avatar: userData.avatar || '/apuntes_mascot.png',
        createdAt: new Date().toISOString(),
      }

      users.push(newUser)
      this.saveLocalUsers(users)

      const userProfile: UserProfile = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        career: newUser.career,
        university: newUser.university,
        avatar: newUser.avatar,
        createdAt: newUser.createdAt,
      }

      // Create initial fresh data for this user
      const freshData: AppData = {
        user: userProfile,
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
          cloudSyncEnabled: false,
        },
      }

      await this.saveData(freshData, userId)
      return { success: true, user: userProfile }
    } catch (err: any) {
      console.error('Error en registro local:', err)
      return { success: false, error: err.message || 'Error al crear la cuenta local.' }
    }
  }

  /**
   * Login user locally (Plug & Play, 100% offline with Bcrypt verification)
   */
  static async loginLocalUser(
    email: string,
    plainPassword: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const users = this.getLocalUsers()
      const normalizedEmail = email.trim().toLowerCase()

      const userRecord = users.find((u) => u.email.toLowerCase() === normalizedEmail)
      if (!userRecord) {
        return { success: false, error: 'No se encontró ninguna cuenta con este correo.' }
      }

      const isMatch = bcrypt.compareSync(plainPassword, userRecord.passwordHash)
      if (!isMatch) {
        return { success: false, error: 'Contraseña incorrecta. Verifica e intenta de nuevo.' }
      }

      const userProfile: UserProfile = {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        career: userRecord.career,
        university: userRecord.university,
        studentId: userRecord.studentId,
        bio: userRecord.bio,
        avatar: userRecord.avatar,
        createdAt: userRecord.createdAt,
      }

      return { success: true, user: userProfile }
    } catch (err: any) {
      console.error('Error en inicio de sesión local:', err)
      return { success: false, error: err.message || 'Error al autenticar usuario.' }
    }
  }

  /**
   * Update profile info in local users index
   */
  static updateLocalUserProfile(userId: string, updates: Partial<UserProfile>): void {
    const users = this.getLocalUsers()
    const index = users.findIndex((u) => u.id === userId)
    if (index !== -1) {
      users[index] = { ...users[index], ...updates }
      this.saveLocalUsers(users)
    }
  }

  /**
   * Load data with priority:
   * 1. Try Electron disk storage (if available and has file)
   * 2. Try browser localStorage for specific userId
   * 3. Fallback to clean initialAppData
   */
  static async loadData(userId?: string | null): Promise<AppData> {
    const key = getStorageKey(userId)
    try {
      // 1. Try Electron native file storage
      if (window.electronAPI) {
        const storedPath = localStorage.getItem('custom_storage_path') || ''
        const res = await window.electronAPI.loadData({
          folderPath: storedPath,
          fileName: userId ? `apuntes_${userId}.json` : FILE_NAME,
        })
        if (res.success && res.data) {
          const parsed = JSON.parse(res.data) as AppData
          localStorage.setItem(key, JSON.stringify(parsed))
          return parsed
        }
      }

      // 2. Try localStorage cache for this specific user
      const cached = localStorage.getItem(key)
      if (cached) {
        return JSON.parse(cached) as AppData
      }
    } catch (err) {
      console.error('Error loading data, falling back to defaults:', err)
    }

    // 3. Fallback to clean initial data
    return initialAppData
  }

  /**
   * Save data immediately to localStorage cache AND to local disk in Electron
   */
  static async saveData(data: AppData, userId?: string | null): Promise<void> {
    const uid = userId || data.user?.id || null
    const key = getStorageKey(uid)
    try {
      const serialized = JSON.stringify(data, null, 2)
      // Save in localStorage for instant offline access
      localStorage.setItem(key, serialized)

      // Save to disk in Electron
      if (window.electronAPI) {
        const folderPath = data.settings.storagePath !== 'Local / Sincronizado' ? data.settings.storagePath : ''
        await window.electronAPI.saveData({
          folderPath,
          fileName: uid ? `apuntes_${uid}.json` : FILE_NAME,
          data: serialized,
        })
      }
    } catch (err) {
      console.error('Error saving data:', err)
    }
  }

  /**
   * Select a custom folder (e.g. inside OneDrive / Dropbox / Local folder)
   */
  static async selectCustomFolder(): Promise<string | null> {
    if (window.electronAPI) {
      const selected = await window.electronAPI.selectFolder()
      if (selected) {
        localStorage.setItem('custom_storage_path', selected)
      }
      return selected
    }
    return null
  }

  /**
   * Export single note as Markdown file
   */
  static async exportNoteAsMarkdown(note: Note, subjectName: string): Promise<boolean> {
    const header = `# ${note.title}\n**Materia:** ${subjectName}\n**Unidad:** ${note.unit}\n**Fecha:** ${new Date(note.createdAt).toLocaleDateString()}\n**Etiquetas:** ${note.tags.join(', ')}\n\n---\n\n`
    
    // Quick HTML to Markdown text cleanup
    const textContent = note.content
      .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n')
      .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n')
      .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n')
      .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
      .replace(/<code>(.*?)<\/code>/gi, '`$1`')
      .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gi, '```\n$1\n```\n')
      .replace(/<blockquote>(.*?)<\/blockquote>/gi, '> $1\n\n')
      .replace(/<ul>([\s\S]*?)<\/ul>/gi, '$1\n')
      .replace(/<li>(.*?)<\/li>/gi, '- $1\n')
      .replace(/<hr\s*\/?>/gi, '\n---\n')
      .replace(/<[^>]+>/g, '')

    const fullMarkdown = header + textContent
    const defaultFileName = `${note.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.md`

    if (window.electronAPI) {
      const res = await window.electronAPI.exportMarkdown({
        defaultName: defaultFileName,
        content: fullMarkdown,
      })
      return res.success || false
    } else {
      // Browser fallback: download blob
      const blob = new Blob([fullMarkdown], { type: 'text/markdown;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = defaultFileName
      a.click()
      URL.revokeObjectURL(url)
      return true
    }
  }

  /**
   * Export entire user data and notes as JSON backup for cross-machine migration
   */
  static exportFullBackup(data: AppData): void {
    const exportPayload = {
      _app: 'Sumire Apuntes',
      _version: '1.0.0',
      exportedAt: new Date().toISOString(),
      user: data.user,
      periods: data.periods,
      subjects: data.subjects,
      notes: data.notes,
      tasks: data.tasks,
      grades: data.grades,
      settings: data.settings,
    }
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const safeName = (data.user?.name || 'estudiante').toLowerCase().replace(/[^a-z0-9]/g, '_')
    const dateStr = new Date().toISOString().split('T')[0]
    a.download = `sumire_backup_${safeName}_${dateStr}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  /**
   * Import database from JSON backup file and restore session
   */
  static async importBackup(file: File): Promise<AppData | null> {
    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as any
      if (parsed && Array.isArray(parsed.subjects) && Array.isArray(parsed.notes)) {
        const cleanData: AppData = {
          user: parsed.user || null,
          periods: Array.isArray(parsed.periods) && parsed.periods.length > 0 ? parsed.periods : [
            {
              id: `period-${Date.now()}`,
              name: '7mo Cuatrimestre',
              type: 'cuatrimestre',
              dateRange: 'Septiembre - Diciembre 2026',
              isCurrent: true,
              createdAt: new Date().toISOString(),
            }
          ],
          subjects: parsed.subjects,
          notes: parsed.notes,
          tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
          grades: Array.isArray(parsed.grades) ? parsed.grades : [],
          settings: parsed.settings || {
            activeSemester: '7mo Cuatrimestre',
            theme: 'dark',
            systemTheme: 'purple',
            storagePath: 'Local / Sincronizado',
            cloudSyncEnabled: false,
          },
        }

        // If user profile is present in backup, register/update them in local users index
        if (cleanData.user?.id) {
          const users = this.getLocalUsers()
          const existingIdx = users.findIndex((u) => u.id === cleanData.user!.id || u.email.toLowerCase() === (cleanData.user!.email || '').toLowerCase())
          if (existingIdx !== -1) {
            users[existingIdx] = {
              ...users[existingIdx],
              name: cleanData.user.name,
              career: cleanData.user.career,
              university: cleanData.user.university,
              avatar: cleanData.user.avatar,
            }
          } else {
            users.push({
              id: cleanData.user.id,
              name: cleanData.user.name,
              email: cleanData.user.email,
              passwordHash: '',
              career: cleanData.user.career,
              university: cleanData.user.university,
              avatar: cleanData.user.avatar,
              createdAt: cleanData.user.createdAt || new Date().toISOString(),
            })
          }
          this.saveLocalUsers(users)
          localStorage.setItem('apuntes_active_user_id', cleanData.user.id)
        }

        await this.saveData(cleanData, cleanData.user?.id)
        return cleanData
      }
    } catch (err) {
      console.error('Error importing backup:', err)
    }
    return null
  }
}
