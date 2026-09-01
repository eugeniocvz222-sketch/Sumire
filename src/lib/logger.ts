export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DB'

export interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  category: string
  message: string
  details?: any
  stack?: string
}

const STORAGE_KEY = 'apuntes_system_logs'
const MAX_LOGS = 150

class SystemLogger {
  private logs: LogEntry[] = []
  private listeners: ((logs: LogEntry[]) => void)[] = []

  constructor() {
    this.loadFromStorage()
    this.setupGlobalHandlers()
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        this.logs = JSON.parse(saved)
      }
    } catch (e) {
      this.logs = []
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs.slice(-MAX_LOGS)))
    } catch (e) {
      // Storage quota or parsing error fallback
    }
    this.notify()
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener([...this.logs])
      } catch (e) {
        // Ignore listener error
      }
    })
  }

  private setupGlobalHandlers() {
    if (typeof window === 'undefined') return

    // Catch unhandled runtime errors
    window.addEventListener('error', (event) => {
      this.error('Runtime_Error', event.message || 'Error no controlado en la aplicación', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      })
    })

    // Catch unhandled Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event.reason
      this.error('Unhandled_Promise', typeof reason === 'string' ? reason : reason?.message || 'Promesa rechazada no controlada', {
        stack: reason?.stack,
      })
    })
  }

  public log(level: LogLevel, category: string, message: string, details?: any, stack?: string) {
    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      details: details ? (typeof details === 'object' ? JSON.parse(JSON.stringify(details)) : details) : undefined,
      stack: stack || (level === 'ERROR' ? new Error().stack : undefined),
    }

    this.logs.push(entry)
    if (this.logs.length > MAX_LOGS) {
      this.logs = this.logs.slice(-MAX_LOGS)
    }

    this.saveToStorage()

    // Also output to DevTools Console with styling
    const color =
      level === 'ERROR' ? '#ef4444' : level === 'WARN' ? '#f59e0b' : level === 'DB' ? '#8b5cf6' : '#3b82f6'
    console.log(
      `%c[${level}]%c [${category}] ${message}`,
      `color: ${color}; font-weight: bold;`,
      'color: inherit;',
      details || ''
    )
  }

  public info(category: string, message: string, details?: any) {
    this.log('INFO', category, message, details)
  }

  public warn(category: string, message: string, details?: any) {
    this.log('WARN', category, message, details)
  }

  public error(category: string, message: string, details?: any, stack?: string) {
    this.log('ERROR', category, message, details, stack)
  }

  public db(action: string, details?: any, success: boolean = true) {
    this.log('DB', action, `Operación DB: ${action} ${success ? '✓ Éxito' : '✗ Falló'}`, details)
  }

  public getLogs(): LogEntry[] {
    return [...this.logs]
  }

  public clearLogs() {
    this.logs = []
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (e) {
      // Ignore
    }
    this.notify()
  }

  public subscribe(callback: (logs: LogEntry[]) => void) {
    this.listeners.push(callback)
    callback([...this.logs])
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback)
    }
  }

  public exportReport(): string {
    const data = {
      exportedAt: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
      logsCount: this.logs.length,
      logs: this.logs,
    }
    return JSON.stringify(data, null, 2)
  }
}

export const logger = new SystemLogger()
