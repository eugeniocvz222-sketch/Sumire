import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import { AppData, AcademicPeriod, Subject, Note, Task, SubjectGrade, UserProfile } from '../src/types'

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'apuntes',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  max: 10,
  idleTimeoutMillis: 30000,
})

export const dbServer = {
  // Test connection and auto-create tables if they don't exist
  async init(): Promise<boolean> {
    try {
      const client = await pool.connect()
      try {
        await client.query(`
          -- Users Table with bcrypt password_hash
          CREATE TABLE IF NOT EXISTS users (
            id VARCHAR(100) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            career VARCHAR(255),
            university VARCHAR(255),
            avatar TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Academic Periods (Cuatrimestres / Semestres)
          CREATE TABLE IF NOT EXISTS academic_periods (
            id VARCHAR(100) PRIMARY KEY,
            user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            type VARCHAR(50) DEFAULT 'cuatrimestre',
            date_range VARCHAR(255),
            is_current BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Subjects (Materias / Libretas)
          CREATE TABLE IF NOT EXISTS subjects (
            id VARCHAR(100) PRIMARY KEY,
            user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
            period_id VARCHAR(100),
            name VARCHAR(255) NOT NULL,
            code VARCHAR(100),
            professor VARCHAR(255),
            classroom VARCHAR(255),
            schedule VARCHAR(255),
            color VARCHAR(50) DEFAULT 'emerald',
            icon VARCHAR(100) DEFAULT 'code',
            semester VARCHAR(100),
            description TEXT,
            units JSONB DEFAULT '[]'::jsonb,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Notes (Apuntes de materias)
          CREATE TABLE IF NOT EXISTS notes (
            id VARCHAR(100) PRIMARY KEY,
            user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
            subject_id VARCHAR(100) REFERENCES subjects(id) ON DELETE CASCADE,
            unit VARCHAR(255),
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            summary TEXT,
            tags JSONB DEFAULT '[]'::jsonb,
            is_favorite BOOLEAN DEFAULT false,
            is_pinned BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Tasks (Tareas, Exámenes y Proyectos)
          CREATE TABLE IF NOT EXISTS tasks (
            id VARCHAR(100) PRIMARY KEY,
            user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
            subject_id VARCHAR(100) REFERENCES subjects(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            type VARCHAR(50) DEFAULT 'task',
            due_date VARCHAR(50),
            priority VARCHAR(50) DEFAULT 'medium',
            is_completed BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );

          -- Grades (Calificaciones)
          CREATE TABLE IF NOT EXISTS grades (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
            subject_id VARCHAR(100) REFERENCES subjects(id) ON DELETE CASCADE,
            partial1 NUMERIC(4,2),
            partial2 NUMERIC(4,2),
            partial3 NUMERIC(4,2),
            final_exam NUMERIC(4,2),
            project NUMERIC(4,2),
            min_passing_grade NUMERIC(4,2) DEFAULT 7.0,
            UNIQUE(user_id, subject_id)
          );
        `)
        console.log('[PostgreSQL] Tablas inicializadas exitosamente en DB "apuntes"')
        return true
      } finally {
        client.release()
      }
    } catch (err: any) {
      console.error('[PostgreSQL] Error al inicializar base de datos:', err.message)
      return false
    }
  },

  // Register with Bcrypt Password Hashing
  async register(
    userData: { name: string; email: string; career?: string; university?: string; avatar?: string },
    plainPassword: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const client = await pool.connect()
      try {
        // Check if user already exists
        const existing = await client.query('SELECT id FROM users WHERE email = $1', [userData.email.trim().toLowerCase()])
        if (existing.rows.length > 0) {
          return { success: false, error: 'Ya existe una cuenta registrada con este correo.' }
        }

        // Salt and hash password with bcrypt (10 rounds)
        const salt = await bcrypt.genSalt(10)
        const passwordHash = await bcrypt.hash(plainPassword, salt)
        const userId = `usr-${Date.now()}`

        const res = await client.query(
          `INSERT INTO users (id, name, email, password_hash, career, university, avatar, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
           RETURNING id, name, email, career, university, avatar, created_at`,
          [
            userId,
            userData.name.trim(),
            userData.email.trim().toLowerCase(),
            passwordHash,
            userData.career || 'Ingeniería en Software',
            userData.university || 'Mi Universidad',
            userData.avatar || null,
          ]
        )

        const user: UserProfile = {
          id: res.rows[0].id,
          name: res.rows[0].name,
          email: res.rows[0].email,
          career: res.rows[0].career,
          university: res.rows[0].university,
          avatar: res.rows[0].avatar,
          createdAt: res.rows[0].created_at.toISOString(),
        }

        // Create initial default period for the new user (7mo Cuatrimestre)
        await client.query(
          `INSERT INTO academic_periods (id, user_id, name, type, date_range, is_current, created_at)
           VALUES ($1, $2, $3, $4, $5, true, NOW())`,
          [`period-${Date.now()}`, user.id, '7mo Cuatrimestre', 'cuatrimestre', 'Septiembre - Diciembre 2026']
        )

        return { success: true, user }
      } finally {
        client.release()
      }
    } catch (err: any) {
      console.error('[PostgreSQL] Error en registro:', err)
      return { success: false, error: err.message }
    }
  },

  // Login with Bcrypt Password Verification
  async login(
    email: string,
    plainPassword: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
    try {
      const client = await pool.connect()
      try {
        const res = await client.query(
          'SELECT id, name, email, password_hash, career, university, avatar, created_at FROM users WHERE email = $1',
          [email.trim().toLowerCase()]
        )

        if (res.rows.length === 0) {
          return { success: false, error: 'No se encontró ningún usuario con este correo.' }
        }

        const dbUser = res.rows[0]
        const isMatch = await bcrypt.compare(plainPassword, dbUser.password_hash)

        if (!isMatch) {
          return { success: false, error: 'Contraseña incorrecta. Verifica e intenta de nuevo.' }
        }

        const user: UserProfile = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          career: dbUser.career,
          university: dbUser.university,
          avatar: dbUser.avatar,
          createdAt: dbUser.created_at ? new Date(dbUser.created_at).toISOString() : new Date().toISOString(),
        }

        return { success: true, user }
      } finally {
        client.release()
      }
    } catch (err: any) {
      console.error('[PostgreSQL] Error en login:', err)
      return { success: false, error: err.message }
    }
  },

  // Load All User Data from PostgreSQL
  async loadUserData(userId: string): Promise<AppData | null> {
    try {
      const client = await pool.connect()
      try {
        // User
        const userRes = await client.query('SELECT id, name, email, career, university, avatar, created_at FROM users WHERE id = $1', [userId])
        if (userRes.rows.length === 0) return null
        const u = userRes.rows[0]
        const user: UserProfile = {
          id: u.id,
          name: u.name,
          email: u.email,
          career: u.career,
          university: u.university,
          avatar: u.avatar,
          createdAt: new Date(u.created_at).toISOString(),
        }

        // Periods
        const periodsRes = await client.query('SELECT * FROM academic_periods WHERE user_id = $1 ORDER BY created_at ASC', [userId])
        const periods: AcademicPeriod[] = periodsRes.rows.map((p) => ({
          id: p.id,
          name: p.name,
          type: p.type,
          dateRange: p.date_range,
          isCurrent: p.is_current,
          createdAt: new Date(p.created_at).toISOString(),
        }))

        // Subjects
        const subjectsRes = await client.query('SELECT * FROM subjects WHERE user_id = $1 ORDER BY created_at DESC', [userId])
        const subjects: Subject[] = subjectsRes.rows.map((s) => ({
          id: s.id,
          periodId: s.period_id,
          name: s.name,
          code: s.code,
          professor: s.professor,
          classroom: s.classroom,
          schedule: s.schedule,
          color: s.color,
          icon: s.icon,
          semester: s.semester,
          description: s.description,
          units: typeof s.units === 'string' ? JSON.parse(s.units) : s.units || [],
          createdAt: new Date(s.created_at).toISOString(),
          updatedAt: new Date(s.updated_at).toISOString(),
        }))

        // Notes
        const notesRes = await client.query('SELECT * FROM notes WHERE user_id = $1 ORDER BY updated_at DESC', [userId])
        const notes: Note[] = notesRes.rows.map((n) => ({
          id: n.id,
          subjectId: n.subject_id,
          unit: n.unit,
          title: n.title,
          content: n.content,
          summary: n.summary,
          tags: typeof n.tags === 'string' ? JSON.parse(n.tags) : n.tags || [],
          isFavorite: n.is_favorite,
          isPinned: n.is_pinned,
          createdAt: new Date(n.created_at).toISOString(),
          updatedAt: new Date(n.updated_at).toISOString(),
          syncStatus: 'synced',
        }))

        // Tasks
        const tasksRes = await client.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY due_date ASC', [userId])
        const tasks: Task[] = tasksRes.rows.map((t) => ({
          id: t.id,
          subjectId: t.subject_id,
          title: t.title,
          description: t.description,
          type: t.type,
          dueDate: t.due_date,
          priority: t.priority,
          isCompleted: t.is_completed,
          createdAt: new Date(t.created_at).toISOString(),
          updatedAt: new Date(t.updated_at).toISOString(),
        }))

        // Grades
        const gradesRes = await client.query('SELECT * FROM grades WHERE user_id = $1', [userId])
        const grades: SubjectGrade[] = gradesRes.rows.map((g) => ({
          subjectId: g.subject_id,
          partial1: g.partial1 ? parseFloat(g.partial1) : undefined,
          partial2: g.partial2 ? parseFloat(g.partial2) : undefined,
          partial3: g.partial3 ? parseFloat(g.partial3) : undefined,
          finalExam: g.final_exam ? parseFloat(g.final_exam) : undefined,
          project: g.project ? parseFloat(g.project) : undefined,
          minPassingGrade: parseFloat(g.min_passing_grade || '7.0'),
        }))

        return {
          user,
          periods: periods.length > 0 ? periods : [
            {
              id: `period-${Date.now()}`,
              name: '7mo Cuatrimestre',
              type: 'cuatrimestre',
              dateRange: 'Septiembre - Diciembre 2026',
              isCurrent: true,
              createdAt: new Date().toISOString(),
            }
          ],
          subjects,
          notes,
          tasks,
          grades,
          settings: {
            activeSemester: '7mo Cuatrimestre',
            theme: 'dark',
            storagePath: 'PostgreSQL Local (DB: apuntes)',
            cloudSyncEnabled: true,
            userEmail: user.email,
            lastSyncedAt: new Date().toISOString(),
          },
        }
      } finally {
        client.release()
      }
    } catch (err: any) {
      console.error('[PostgreSQL] Error al cargar datos:', err)
      return null
    }
  },

  // Save / Sync Complete User Data to PostgreSQL
  async saveUserData(userId: string, data: AppData): Promise<boolean> {
    try {
      const client = await pool.connect()
      try {
        await client.query('BEGIN')

        // Update User info & Avatar
        if (data.user) {
          await client.query(
            `UPDATE users
             SET name = $1, career = $2, university = $3, avatar = $4, updated_at = NOW()
             WHERE id = $5`,
            [data.user.name, data.user.career, data.user.university, data.user.avatar, userId]
          )
        }

        // Sync Periods
        for (const p of data.periods) {
          await client.query(
            `INSERT INTO academic_periods (id, user_id, name, type, date_range, is_current, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id) DO UPDATE SET
               name = EXCLUDED.name,
               type = EXCLUDED.type,
               date_range = EXCLUDED.date_range,
               is_current = EXCLUDED.is_current`,
            [p.id, userId, p.name, p.type, p.dateRange, p.isCurrent, p.createdAt || new Date().toISOString()]
          )
        }

        // Sync Subjects
        for (const s of data.subjects) {
          await client.query(
            `INSERT INTO subjects (id, user_id, period_id, name, code, professor, classroom, schedule, color, icon, semester, description, units, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
             ON CONFLICT (id) DO UPDATE SET
               name = EXCLUDED.name,
               code = EXCLUDED.code,
               professor = EXCLUDED.professor,
               classroom = EXCLUDED.classroom,
               schedule = EXCLUDED.schedule,
               color = EXCLUDED.color,
               icon = EXCLUDED.icon,
               semester = EXCLUDED.semester,
               description = EXCLUDED.description,
               units = EXCLUDED.units,
               updated_at = EXCLUDED.updated_at`,
            [
              s.id,
              userId,
              s.periodId || null,
              s.name,
              s.code,
              s.professor || null,
              s.classroom || null,
              s.schedule || null,
              s.color,
              s.icon,
              s.semester,
              s.description || null,
              JSON.stringify(s.units || []),
              s.createdAt || new Date().toISOString(),
              s.updatedAt || new Date().toISOString(),
            ]
          )
        }

        // Sync Notes
        for (const n of data.notes) {
          await client.query(
            `INSERT INTO notes (id, user_id, subject_id, unit, title, content, summary, tags, is_favorite, is_pinned, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
             ON CONFLICT (id) DO UPDATE SET
               unit = EXCLUDED.unit,
               title = EXCLUDED.title,
               content = EXCLUDED.content,
               summary = EXCLUDED.summary,
               tags = EXCLUDED.tags,
               is_favorite = EXCLUDED.is_favorite,
               is_pinned = EXCLUDED.is_pinned,
               updated_at = EXCLUDED.updated_at`,
            [
              n.id,
              userId,
              n.subjectId,
              n.unit || null,
              n.title,
              n.content,
              n.summary || null,
              JSON.stringify(n.tags || []),
              n.isFavorite || false,
              n.isPinned || false,
              n.createdAt || new Date().toISOString(),
              n.updatedAt || new Date().toISOString(),
            ]
          )
        }

        // Sync Tasks
        for (const t of data.tasks) {
          await client.query(
            `INSERT INTO tasks (id, user_id, subject_id, title, description, type, due_date, priority, is_completed, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
             ON CONFLICT (id) DO UPDATE SET
               title = EXCLUDED.title,
               description = EXCLUDED.description,
               type = EXCLUDED.type,
               due_date = EXCLUDED.due_date,
               priority = EXCLUDED.priority,
               is_completed = EXCLUDED.is_completed,
               updated_at = EXCLUDED.updated_at`,
            [
              t.id,
              userId,
              t.subjectId,
              t.title,
              t.description || null,
              t.type,
              t.dueDate,
              t.priority,
              t.isCompleted,
              t.createdAt || new Date().toISOString(),
              t.updatedAt || new Date().toISOString(),
            ]
          )
        }

        // Sync Grades
        for (const g of data.grades || []) {
          await client.query(
            `INSERT INTO grades (user_id, subject_id, partial1, partial2, partial3, final_exam, project, min_passing_grade)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (user_id, subject_id) DO UPDATE SET
               partial1 = EXCLUDED.partial1,
               partial2 = EXCLUDED.partial2,
               partial3 = EXCLUDED.partial3,
               final_exam = EXCLUDED.final_exam,
               project = EXCLUDED.project,
               min_passing_grade = EXCLUDED.min_passing_grade`,
            [userId, g.subjectId, g.partial1 || null, g.partial2 || null, g.partial3 || null, g.finalExam || null, g.project || null, g.minPassingGrade || 7.0]
          )
        }

        await client.query('COMMIT')
        return true
      } catch (e) {
        await client.query('ROLLBACK')
        throw e
      } finally {
        client.release()
      }
    } catch (err: any) {
      console.error('[PostgreSQL] Error al guardar datos:', err.message)
      return false
    }
  },
}
