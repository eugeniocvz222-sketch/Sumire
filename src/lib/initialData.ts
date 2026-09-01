import { AppData, Subject, Note, Task, AppSettings, AcademicPeriod, SubjectGrade, UserProfile } from '../types'

const defaultUser: UserProfile = {
  id: 'usr-1',
  name: 'Eugenio Cavazos',
  email: 'eugenio@universidad.edu',
  career: 'Ingeniería en Software',
  university: 'Mi Universidad',
  studentId: '2026-MAT-701',
  bio: 'Estudiante universitario enfocado en desarrollo de software y sistemas distribuidos.',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=student1',
  banner: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1200&auto=format&fit=crop',
  createdAt: new Date().toISOString(),
}

const defaultPeriods: AcademicPeriod[] = [
  {
    id: 'period-1',
    name: '7mo Cuatrimestre',
    type: 'cuatrimestre',
    dateRange: 'Septiembre - Diciembre 2026',
    isCurrent: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'period-2',
    name: '6to Cuatrimestre',
    type: 'cuatrimestre',
    dateRange: 'Mayo - Agosto 2026',
    isCurrent: false,
    createdAt: new Date(Date.now() - 86400000 * 120).toISOString(),
  },
]

const defaultSubjects: Subject[] = [
  {
    id: 'sub-1',
    periodId: 'period-1',
    name: 'Estructuras de Datos y Algoritmos',
    code: 'CS-201',
    professor: 'Dr. Alejandro Morales',
    classroom: 'Laboratorio de Cómputo 3',
    schedule: 'Lunes y Miércoles 08:00 - 10:00',
    color: 'emerald',
    icon: 'code',
    semester: '7mo Cuatrimestre',
    description: 'Estudio de estructuras lineales, árboles binarios, grafos y algoritmos de ordenamiento/búsqueda.',
    units: ['Unidad 1: Complejidad y Recursión', 'Unidad 2: Listas, Pilas y Colas', 'Unidad 3: Árboles y Grafos'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub-2',
    periodId: 'period-1',
    name: 'Cálculo Integral y Vectorial',
    code: 'MAT-204',
    professor: 'M.C. Elena Rostova',
    classroom: 'Edificio B - Aula 204',
    schedule: 'Martes y Jueves 10:00 - 12:00',
    color: 'blue',
    icon: 'calculator',
    semester: '7mo Cuatrimestre',
    description: 'Métodos de integración, cálculo en varias variables e integrales múltiples.',
    units: ['Parcial 1: Técnicas de Integración', 'Parcial 2: Aplicaciones de la Integral', 'Parcial 3: Integrales Múltiples'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub-3',
    periodId: 'period-1',
    name: 'Bases de Datos Relacionales',
    code: 'CS-205',
    professor: 'Ing. Roberto Silva',
    classroom: 'Edificio C - Aula 101',
    schedule: 'Viernes 08:00 - 12:00',
    color: 'violet',
    icon: 'database',
    semester: '7mo Cuatrimestre',
    description: 'Diseño conceptual, normalización, modelado E-R y lenguaje SQL avanzado.',
    units: ['Unidad 1: Modelo Entidad-Relación', 'Unidad 2: Álgebra Relacional y SQL', 'Unidad 3: Transacciones e Índices'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'sub-4',
    periodId: 'period-1',
    name: 'Física: Electromagnetismo',
    code: 'FIS-103',
    professor: 'Dra. Carmen Valenzuela',
    classroom: 'Edificio F - Lab de Física',
    schedule: 'Miércoles y Viernes 12:00 - 14:00',
    color: 'amber',
    icon: 'atom',
    semester: '7mo Cuatrimestre',
    description: 'Campos electrostáticos, Ley de Gauss, Circuitos de corriente continua y magnetismo.',
    units: ['Parcial 1: Carga y Ley de Coulomb', 'Parcial 2: Campo Eléctrico y Ley de Gauss', 'Parcial 3: Circuitos'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const defaultNotes: Note[] = [
  {
    id: 'note-1',
    subjectId: 'sub-1',
    unit: 'Unidad 2: Listas, Pilas y Colas',
    title: 'Pilas (Stacks) y Colas (Queues) en C++',
    summary: 'Diferencias clave entre LIFO y FIFO, implementaciones y complejidades.',
    tags: ['c++', 'memoria', 'pilas', 'colas'],
    isFavorite: true,
    isPinned: true,
    content: `
      <h1>Pilas (Stacks) y Colas (Queues)</h1>
      <p>Hoy revisamos las estructuras de datos lineales fundamentales y su gestión en memoria.</p>
      
      <h2>1. Pilas (Stack - LIFO)</h2>
      <p><strong>LIFO (Last In, First Out):</strong> El último elemento en entrar es el primero en salir. Operaciones clave:</p>
      <ul>
        <li><code>push(x)</code>: Inserta un elemento en el tope. Complejidad: <strong>O(1)</strong></li>
        <li><code>pop()</code>: Remueve el elemento del tope. Complejidad: <strong>O(1)</strong></li>
        <li><code>top() / peek()</code>: Consulta el tope sin removerlo.</li>
      </ul>

      <blockquote>
        <strong>Regla de oro:</strong> Una pila se utiliza para la pila de llamadas de funciones (call stack), desacer cambios (Ctrl+Z) y evaluar expresiones matemáticas.
      </blockquote>

      <h2>2. Colas (Queue - FIFO)</h2>
      <p><strong>FIFO (First In, First Out):</strong> El primer elemento en entrar es el primero en salir.</p>
      <pre><code>// Ejemplo de uso en C++
#include &lt;iostream&gt;
#include &lt;stack&gt;
#include &lt;queue&gt;

int main() {
    std::stack&lt;int&gt; miPila;
    miPila.push(10);
    miPila.push(20);
    std::cout << "Tope: " << miPila.top() << std::endl; // 20
    return 0;
}</code></pre>
      
      <ul data-type="taskList">
        <li data-checked="true"><label><input type="checkbox" checked="checked"><span></span></label><div>Repasar diferencias con Listas Enlazadas</div></li>
        <li data-checked="false"><label><input type="checkbox"><span></span></label><div>Hacer la práctica del lab sobre balanceo de paréntesis</div></li>
      </ul>
    `,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    syncStatus: 'synced',
  },
  {
    id: 'note-2',
    subjectId: 'sub-2',
    unit: 'Parcial 1: Técnicas de Integración',
    title: 'Integración por Partes y Sustitución Trigonométrica',
    summary: 'Fórmula de integración por partes: un día vi una vaca vestida de uniforme.',
    tags: ['cálculo', 'fórmulas', 'parcial 1'],
    isFavorite: true,
    isPinned: false,
    content: `
      <h1>Integración por Partes</h1>
      <p>La fórmula clásica derivada de la regla del producto para derivadas:</p>
      <blockquote>
        <strong>Fórmula:</strong> ∫ u dv = u·v - ∫ v du
      </blockquote>
      
      <h2>Mnemotecnia ILATE para elegir "u":</h2>
      <ol>
        <li><strong>I:</strong> Inversas trigonométricas (arcsin, arctan...)</li>
        <li><strong>L:</strong> Logarítmicas (ln x, log x...)</li>
        <li><strong>A:</strong> Algebraicas (x², 3x, x...)</li>
        <li><strong>T:</strong> Trigonométricas (sin x, cos x...)</li>
        <li><strong>E:</strong> Exponenciales (eˣ, 2ˣ...)</li>
      </ol>

      <p>La que esté más arriba en la lista ILATE será tu variable <code>u</code>.</p>
    `,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    syncStatus: 'synced',
  },
  {
    id: 'note-3',
    subjectId: 'sub-3',
    unit: 'Unidad 2: Álgebra Relacional y SQL',
    title: 'JOINs en SQL y Cláusulas Agregadas',
    summary: 'INNER JOIN, LEFT JOIN, GROUP BY y HAVING con ejemplos prácticos.',
    tags: ['sql', 'queries', 'database'],
    isFavorite: false,
    isPinned: false,
    content: `
      <h1>Consultas Avanzadas en SQL</h1>
      <p>Diferencias entre los tipos de JOINs más usados:</p>
      <ul>
        <li><strong>INNER JOIN:</strong> Solo devuelve filas donde hay coincidencia en ambas tablas.</li>
        <li><strong>LEFT JOIN:</strong> Devuelve todas las filas de la tabla izquierda y las coincidentes de la derecha.</li>
      </ul>
      
      <pre><code>SELECT e.nombre, d.nombre_departamento, AVG(e.salario) as promedio
FROM empleados e
LEFT JOIN departamentos d ON e.depto_id = d.id
GROUP BY e.nombre, d.nombre_departamento
HAVING AVG(e.salario) > 15000;</code></pre>
    `,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date().toISOString(),
    syncStatus: 'synced',
  },
]

const defaultTasks: Task[] = [
  {
    id: 'task-1',
    subjectId: 'sub-1',
    title: 'Entrega de Práctica 2: Implementar Árbol AVL',
    description: 'Subir repositorio de GitHub con código en C++ y reporte en PDF.',
    type: 'project',
    dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    priority: 'high',
    isCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    subjectId: 'sub-2',
    title: 'Primer Examen Parcial de Cálculo',
    description: 'Entran temas de sustitución, partes y fracciones parciales.',
    type: 'exam',
    dueDate: new Date(Date.now() + 86400000 * 6).toISOString().split('T')[0],
    priority: 'high',
    isCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    subjectId: 'sub-3',
    title: 'Resolver ejercicios de Normalización (1FN, 2FN, 3FN)',
    description: 'Páginas 45-48 del libro de Korth.',
    type: 'task',
    dueDate: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0],
    priority: 'medium',
    isCompleted: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const defaultGrades: SubjectGrade[] = [
  {
    subjectId: 'sub-1',
    partial1: 9.5,
    partial2: 9.0,
    partial3: undefined,
    project: 10,
    minPassingGrade: 7.0,
  },
  {
    subjectId: 'sub-2',
    partial1: 8.5,
    partial2: undefined,
    partial3: undefined,
    minPassingGrade: 7.0,
  },
  {
    subjectId: 'sub-3',
    partial1: 10,
    partial2: 9.5,
    partial3: undefined,
    project: 9.8,
    minPassingGrade: 7.0,
  },
  {
    subjectId: 'sub-4',
    partial1: 8.0,
    partial2: undefined,
    partial3: undefined,
    minPassingGrade: 7.0,
  },
]

const defaultSettings: AppSettings = {
  activePeriodId: 'period-1',
  activeSemester: '7mo Cuatrimestre',
  theme: 'dark',
  systemTheme: 'purple',
  storagePath: 'Local / Sincronizado',
  cloudSyncEnabled: false,
  lastSyncedAt: new Date().toISOString(),
}

export const initialAppData: AppData = {
  user: null,
  periods: defaultPeriods,
  subjects: [],
  notes: [],
  tasks: [],
  grades: [],
  settings: defaultSettings,
}
