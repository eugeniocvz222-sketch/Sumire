import { AppData, UserProfile } from '../types'

export const dbClient = {
  // Initialize Database / Tables
  async init(): Promise<boolean> {
    try {
      const res = await fetch('/api/db/init', { method: 'POST' })
      const data = await res.json()
      return data.success
    } catch (e) {
      console.warn('[DB Client] PostgreSQL Init fallback:', e)
      return false
    }
  },

  // Register with Bcrypt Password Hashing in PostgreSQL
  async register(
    userData: { name: string; email: string; career?: string; university?: string; avatar?: string },
    plainPassword: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const res = await fetch('/api/db/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userData, password: plainPassword }),
      })
      const data = await res.json()
      return data
    } catch (e: any) {
      return { success: false, error: e.message || 'Error al conectar con la base de datos' }
    }
  },

  // Login with Bcrypt Password Verification in PostgreSQL
  async login(
    email: string,
    plainPassword: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const res = await fetch('/api/db/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: plainPassword }),
      })
      const data = await res.json()
      return data
    } catch (e: any) {
      return { success: false, error: e.message || 'Error al conectar con la base de datos' }
    }
  },

  // Load User Data from PostgreSQL
  async loadUserData(userId: string): Promise<AppData | null> {
    try {
      const res = await fetch('/api/db/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const data = await res.json()
      if (data.success && data.data) {
        return data.data
      }
      return null
    } catch (e) {
      console.warn('[DB Client] Error loading PostgreSQL user data:', e)
      return null
    }
  },

  // Save User Data to PostgreSQL
  async saveUserData(userId: string, appData: AppData): Promise<boolean> {
    try {
      const res = await fetch('/api/db/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, data: appData }),
      })
      const data = await res.json()
      return data.success
    } catch (e) {
      console.warn('[DB Client] Error saving to PostgreSQL:', e)
      return false
    }
  },
}
