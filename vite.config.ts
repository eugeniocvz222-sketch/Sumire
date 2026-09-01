import 'dotenv/config'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import electron from 'vite-plugin-electron/simple'
import path from 'node:path'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

// PostgreSQL Pool for Dev Server
const pgPool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'apuntes',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
  max: 10,
})

function postgresDevApiPlugin(): Plugin {
  return {
    name: 'postgres-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/db/')) {
          return next()
        }

        const endpoint = req.url.replace('/api/db/', '').split('?')[0]

        // Parse JSON Body
        let body: any = {}
        if (req.method === 'POST') {
          try {
            const buffers: any[] = []
            for await (const chunk of req) {
              buffers.push(chunk)
            }
            const data = Buffer.concat(buffers).toString()
            body = data ? JSON.parse(data) : {}
          } catch (e) {
            body = {}
          }
        }

        res.setHeader('Content-Type', 'application/json')

        try {
          if (endpoint === 'init') {
            const client = await pgPool.connect()
            try {
              await client.query(`
                CREATE TABLE IF NOT EXISTS users (
                  id VARCHAR(100) PRIMARY KEY,
                  name VARCHAR(255) NOT NULL,
                  email VARCHAR(255) UNIQUE NOT NULL,
                  password_hash TEXT NOT NULL,
                  career VARCHAR(255),
                  university VARCHAR(255),
                  student_id VARCHAR(100),
                  bio TEXT,
                  avatar TEXT,
                  banner TEXT,
                  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
                ALTER TABLE users ADD COLUMN IF NOT EXISTS banner TEXT;
                ALTER TABLE users ADD COLUMN IF NOT EXISTS student_id VARCHAR(100);
                ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
                CREATE TABLE IF NOT EXISTS academic_periods (
                  id VARCHAR(100) PRIMARY KEY,
                  user_id VARCHAR(100) REFERENCES users(id) ON DELETE CASCADE,
                  name VARCHAR(255) NOT NULL,
                  type VARCHAR(50) DEFAULT 'cuatrimestre',
                  date_range VARCHAR(255),
                  is_current BOOLEAN DEFAULT false,
                  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
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
              res.end(JSON.stringify({ success: true, message: 'PostgreSQL DB "apuntes" initialized' }))
            } finally {
              client.release()
            }
          } else if (endpoint === 'register') {
            const { userData, password } = body
            const client = await pgPool.connect()
            try {
              const existing = await client.query('SELECT id FROM users WHERE email = $1', [userData.email.trim().toLowerCase()])
              if (existing.rows.length > 0) {
                res.statusCode = 400
                return res.end(JSON.stringify({ success: false, error: 'Ya existe una cuenta con este correo.' }))
              }

              const salt = await bcrypt.genSalt(10)
              const passwordHash = await bcrypt.hash(password, salt)
              const userId = `usr-${Date.now()}`

              const result = await client.query(
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

              const user = {
                id: result.rows[0].id,
                name: result.rows[0].name,
                email: result.rows[0].email,
                career: result.rows[0].career,
                university: result.rows[0].university,
                avatar: result.rows[0].avatar,
                createdAt: result.rows[0].created_at.toISOString(),
              }

              // Create default 7mo Cuatrimestre period
              await client.query(
                `INSERT INTO academic_periods (id, user_id, name, type, date_range, is_current, created_at)
                 VALUES ($1, $2, $3, $4, $5, true, NOW())`,
                [`period-${Date.now()}`, user.id, '7mo Cuatrimestre', 'cuatrimestre', 'Septiembre - Diciembre 2026']
              )

              res.end(JSON.stringify({ success: true, user }))
            } finally {
              client.release()
            }
          } else if (endpoint === 'login') {
            const { email, password } = body
            const client = await pgPool.connect()
            try {
              const resQuery = await client.query(
                'SELECT id, name, email, password_hash, career, university, avatar, created_at FROM users WHERE email = $1',
                [email.trim().toLowerCase()]
              )
              if (resQuery.rows.length === 0) {
                res.statusCode = 401
                return res.end(JSON.stringify({ success: false, error: 'Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.' }))
              }

              const dbUser = resQuery.rows[0]
              const isMatch = await bcrypt.compare(password, dbUser.password_hash)
              if (!isMatch) {
                res.statusCode = 401
                return res.end(JSON.stringify({ success: false, error: 'Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.' }))
              }

              const user = {
                id: dbUser.id,
                name: dbUser.name,
                email: dbUser.email,
                career: dbUser.career,
                university: dbUser.university,
                avatar: dbUser.avatar,
                createdAt: dbUser.created_at ? new Date(dbUser.created_at).toISOString() : new Date().toISOString(),
              }
              res.end(JSON.stringify({ success: true, user }))
            } finally {
              client.release()
            }
          } else if (endpoint === 'load') {
            const { userId } = body
            const client = await pgPool.connect()
            try {
              const userRes = await client.query('SELECT id, name, email, career, university, student_id, bio, avatar, banner, created_at FROM users WHERE id = $1', [userId])
              if (userRes.rows.length === 0) {
                res.statusCode = 404
                return res.end(JSON.stringify({ success: false, error: 'Usuario no encontrado' }))
              }

              const u = userRes.rows[0]
              const user = {
                id: u.id,
                name: u.name,
                email: u.email,
                career: u.career,
                university: u.university,
                studentId: u.student_id,
                bio: u.bio,
                avatar: u.avatar,
                banner: u.banner,
                createdAt: new Date(u.created_at).toISOString(),
              }

              const periodsRes = await client.query('SELECT * FROM academic_periods WHERE user_id = $1 ORDER BY created_at ASC', [userId])
              const periods = periodsRes.rows.map((p) => ({
                id: p.id,
                name: p.name,
                type: p.type,
                dateRange: p.date_range,
                isCurrent: p.is_current,
                createdAt: new Date(p.created_at).toISOString(),
              }))

              const subjectsRes = await client.query('SELECT * FROM subjects WHERE user_id = $1 ORDER BY created_at DESC', [userId])
              const subjects = subjectsRes.rows.map((s) => ({
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

              const notesRes = await client.query('SELECT * FROM notes WHERE user_id = $1 ORDER BY updated_at DESC', [userId])
              const notes = notesRes.rows.map((n) => ({
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

              const tasksRes = await client.query('SELECT * FROM tasks WHERE user_id = $1 ORDER BY due_date ASC', [userId])
              const tasks = tasksRes.rows.map((t) => ({
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

              const gradesRes = await client.query('SELECT * FROM grades WHERE user_id = $1', [userId])
              const grades = gradesRes.rows.map((g) => ({
                subjectId: g.subject_id,
                partial1: g.partial1 ? parseFloat(g.partial1) : undefined,
                partial2: g.partial2 ? parseFloat(g.partial2) : undefined,
                partial3: g.partial3 ? parseFloat(g.partial3) : undefined,
                finalExam: g.final_exam ? parseFloat(g.final_exam) : undefined,
                project: g.project ? parseFloat(g.project) : undefined,
                minPassingGrade: parseFloat(g.min_passing_grade || '7.0'),
              }))

              res.end(
                JSON.stringify({
                  success: true,
                  data: {
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
                  },
                })
              )
            } finally {
              client.release()
            }
          } else if (endpoint === 'save') {
            const { userId, data } = body
            const client = await pgPool.connect()
            try {
              await client.query('BEGIN')

              if (data.user) {
                await client.query(
                  `UPDATE users
                   SET name = $1, career = $2, university = $3, avatar = $4, banner = $5, student_id = $6, bio = $7, updated_at = NOW()
                   WHERE id = $8`,
                  [
                    data.user.name,
                    data.user.career,
                    data.user.university,
                    data.user.avatar,
                    data.user.banner || null,
                    data.user.studentId || null,
                    data.user.bio || null,
                    userId,
                  ]
                )
              }

              // 1. Sync Periods
              const periodIds = (data.periods || []).map((p: any) => p.id)
              if (periodIds.length > 0) {
                await client.query('DELETE FROM academic_periods WHERE user_id = $1 AND NOT (id = ANY($2))', [userId, periodIds])
              } else {
                await client.query('DELETE FROM academic_periods WHERE user_id = $1', [userId])
              }
              for (const p of data.periods || []) {
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

              // 2. Sync Subjects
              const subjectIds = (data.subjects || []).map((s: any) => s.id)
              if (subjectIds.length > 0) {
                await client.query('DELETE FROM subjects WHERE user_id = $1 AND NOT (id = ANY($2))', [userId, subjectIds])
              } else {
                await client.query('DELETE FROM subjects WHERE user_id = $1', [userId])
              }
              for (const s of data.subjects || []) {
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

              // 3. Sync Notes
              const noteIds = (data.notes || []).map((n: any) => n.id)
              if (noteIds.length > 0) {
                await client.query('DELETE FROM notes WHERE user_id = $1 AND NOT (id = ANY($2))', [userId, noteIds])
              } else {
                await client.query('DELETE FROM notes WHERE user_id = $1', [userId])
              }
              for (const n of data.notes || []) {
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

              // 4. Sync Tasks
              const taskIds = (data.tasks || []).map((t: any) => t.id)
              if (taskIds.length > 0) {
                await client.query('DELETE FROM tasks WHERE user_id = $1 AND NOT (id = ANY($2))', [userId, taskIds])
              } else {
                await client.query('DELETE FROM tasks WHERE user_id = $1', [userId])
              }
              for (const t of data.tasks || []) {
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

              await client.query('COMMIT')
              res.end(JSON.stringify({ success: true }))
            } catch (e: any) {
              await client.query('ROLLBACK')
              res.statusCode = 500
              res.end(JSON.stringify({ success: false, error: e.message }))
            } finally {
              client.release()
            }
          } else {
            res.statusCode = 404
            res.end(JSON.stringify({ error: 'Endpoint not found' }))
          }
        } catch (err: any) {
          res.statusCode = 500
          res.end(JSON.stringify({ success: false, error: err.message }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    postgresDevApiPlugin(),
    electron({
      main: {
        entry: 'electron/main.ts',
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
      },
    }),
  ],
  server: {
    watch: {
      ignored: ['**/release/**', '**/dist-package/**', '**/*.exe', '**/*.tmp/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) return 'vendor-react'
            if (id.includes('framer-motion')) return 'vendor-framer'
            if (id.includes('lucide-react')) return 'vendor-icons'
            if (id.includes('@tiptap')) return 'vendor-tiptap'
          }
        },
      },
    },
  },
})
