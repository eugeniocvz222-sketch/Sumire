import { AppData, Note } from '../types'
import { initialAppData } from './initialData'

const FILE_NAME = 'apuntes_data.json'

function getStorageKey(userId?: string | null): string {
  if (userId) return `apuntes_universitarios_user_${userId}`
  return 'apuntes_universitarios_data_v1'
}

export class StorageService {
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
   * Export entire database as JSON backup
   */
  static exportFullBackup(data: AppData): void {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `apuntes_backup_${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  /**
   * Import database from JSON backup file
   */
  static async importBackup(file: File): Promise<AppData | null> {
    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as AppData
      if (parsed.subjects && parsed.notes && parsed.tasks) {
        await this.saveData(parsed)
        return parsed
      }
    } catch (err) {
      console.error('Error importing backup:', err)
    }
    return null
  }
}
