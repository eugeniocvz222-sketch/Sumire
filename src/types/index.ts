export type SubjectColor = 
  | 'blue' 
  | 'emerald' 
  | 'violet' 
  | 'amber' 
  | 'rose' 
  | 'cyan' 
  | 'indigo' 
  | 'orange'
  | 'fuchsia'
  | 'slate'

export type SubjectIcon = 
  | 'book-open'
  | 'calculator'
  | 'code'
  | 'atom'
  | 'database'
  | 'cpu'
  | 'flask-conical'
  | 'chart-bar'
  | 'pen-tool'
  | 'binary'
  | 'network'
  | 'sigma'
  | 'microscope'
  | 'briefcase'
  | 'globe'
  | 'terminal'

export type PeriodType = 'cuatrimestre' | 'semestre' | 'trimestre' | 'personalizado'

export interface AcademicPeriod {
  id: string
  name: string // ej. "7mo Cuatrimestre"
  type: PeriodType
  dateRange: string // ej. "Septiembre - Diciembre 2026"
  isCurrent: boolean
  createdAt: string
}

export interface SubjectGrade {
  subjectId: string
  partial1?: number
  partial2?: number
  partial3?: number
  finalExam?: number
  project?: number
  minPassingGrade: number
}

export interface Subject {
  id: string
  periodId?: string
  name: string
  code: string
  professor?: string
  classroom?: string
  schedule?: string
  color: SubjectColor
  icon: SubjectIcon
  pattern?: 'minimal' | 'grid' | 'dots' | 'blueprint' | 'wave' | 'hologram'
  semester: string // nombre del periodo/semestre/cuatrimestre
  description?: string
  units: string[]
  createdAt: string
  updatedAt: string
}

export interface NoteVersion {
  id: string
  noteId: string
  title: string
  content: string // HTML format snapshot
  summary?: string
  createdAt: string
  characterCount: number
  wordCount: number
  label?: string // e.g. "Auto-guardado", "Punto de control", "Antes de restaurar"
}

export interface Note {
  id: string
  subjectId: string
  unit: string
  title: string
  content: string // HTML format
  summary?: string
  tags: string[]
  isFavorite: boolean
  isPinned: boolean
  versions?: NoteVersion[]
  createdAt: string
  updatedAt: string
  syncStatus: 'synced' | 'pending' | 'local_only'
}

export type TaskType = 'task' | 'exam' | 'project' | 'quiz'
export type PriorityLevel = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  subjectId: string
  title: string
  description?: string
  type: TaskType
  dueDate: string // YYYY-MM-DD
  priority: PriorityLevel
  isCompleted: boolean
  createdAt: string
  updatedAt: string
}

export type BannerFitMode = 'cover' | 'contain'
export type BannerHeightMode = 'compact' | 'normal' | 'cinematic' | 'tall'

export interface UserProfile {
  id: string
  name: string
  email: string
  studentId?: string // Matrícula estudiantil
  university?: string
  career?: string
  bio?: string
  avatar?: string // Base64 string for offline & cross-PC sync
  banner?: string // Base64 string or preset URL
  bannerFit?: BannerFitMode // 'cover' (llena todo) o 'contain' (muestra completa con fondo ambiental)
  bannerOffsetY?: number // 0 to 100 percentage
  bannerOffsetX?: number // 0 to 100 percentage
  bannerZoom?: number // 1 to 3
  bannerHeight?: BannerHeightMode // 'compact' | 'normal' | 'cinematic' | 'tall'
  createdAt: string
}

export type SystemTheme = 'purple' | 'red' | 'emerald' | 'blue' | 'amber' | 'cyberpunk'

export type AIProviderType = 'gemini' | 'openai' | 'ollama' | 'off'

export interface AIConfig {
  provider: AIProviderType
  geminiApiKey?: string
  geminiModel?: string
  openaiApiKey?: string
  openaiModel?: string
  openaiBaseUrl?: string
  ollamaEndpoint?: string
  ollamaModel?: string
}

export interface AppSettings {
  activePeriodId?: string
  activeSemester: string
  theme: 'dark' | 'light' | 'system'
  systemTheme?: SystemTheme
  storagePath: string
  cloudSyncEnabled: boolean
  supabaseUrl?: string
  supabaseAnonKey?: string
  userEmail?: string
  lastSyncedAt?: string
  aiConfig?: AIConfig
}

export interface AppData {
  user?: UserProfile | null
  periods: AcademicPeriod[]
  subjects: Subject[]
  notes: Note[]
  tasks: Task[]
  grades: SubjectGrade[]
  settings: AppSettings
}

