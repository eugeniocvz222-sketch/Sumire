<div align="center">

  <img src="./public/apuntes_mascot.png" alt="Sumire Apuntes Mascot" width="160" style="border-radius: 50%; box-shadow: 0 10px 30px rgba(168, 85, 247, 0.4);" />

  # 🌸 Sumire Apuntes Universitarios
  
  **Tu espacio de estudio digital inteligente con libretas 3D, horario dinámico y control de versiones.**

  [![Version](https://img.shields.io/badge/version-1.0.0-8b5cf6.svg?style=for-the-badge&logo=semver&logoColor=white)](CHANGELOG.md)
  [![React](https://img.shields.io/badge/React-19.2-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Electron](https://img.shields.io/badge/Electron-44.1-47848F.svg?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-8.2-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.3-38B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

  <p align="center">
    <a href="#-características-principales">Características</a> •
    <a href="#-capturas-y-diseño">Diseño 3D</a> •
    <a href="#-instalación-y-ejecución">Instalación</a> •
    <a href="#-empaquetado-a-exe">Generar .EXE</a> •
    <a href="#-atajos-de-teclado">Atajos</a>
  </p>

</div>

---

## ✨ Descripción General

**Sumire Apuntes** es una aplicación de escritorio moderna diseñada específicamente para estudiantes universitarios. Combina una interfaz estética inspirada en el diseño moderno de **21st.dev**, física tridimensional realista en libretas de estudio, edición en tiempo real con Markdown y listas interactivas, además de un sistema **Offline-First** que te permite tomar notas en clase sin depender de conexión a internet.

---

## 🚀 Características Principales

### 📖 1. Libretas Digitales 3D Realistas
* **Física y Perspectiva 3D:** Cada materia cobra vida en una libreta tridimensional con grosor de hojas físicas, lomo grabado con relieve y listón marcapáginas dinámico.
* **Estudio de Personalización en Vivo:** Diseña tus materias eligiendo entre 6 patrones táctiles (*Minimal*, *Cuadrícula Técnica*, *Blueprint*, *Matriz de Puntos*, *Ondas Japonesas*, *Cyber Grid*), paletas de colores y ángulos de inclinación interactivos.

### ✍️ 2. Editor de Apuntes Universitario (TipTap & Markdown)
* **Formato Enriquecido Instantáneo:** Títulos jerárquicos (H1, H2, H3), listas de tareas interactivas, bloques de código, citas y fórmulas.
* **Barra de Herramientas Reactiva:** Sincronización en tiempo real que resalta las herramientas activas según la posición de tu cursor.
* **Exportación Rápida:** Descarga cualquier nota como archivo `.md` independiente con un solo clic.

### 🕒 3. Historial de Versiones y Puntos de Restauración
* **Línea de Tiempo de Snapshots:** Guarda automáticamente versiones anteriores de cada nota con fecha, hora exacta, número de palabras y caracteres.
* **Previsualizador de Revisiones:** Inspecciona cambios anteriores sin modificar tu nota activa.
* **Restauración Segura en 1 Clic:** Vuelve al estado deseado creando un respaldo automático del texto actual antes de restaurar.
* **Puntos de Control Manuales:** Crea marcas con nombres personalizados (ej. *"Antes del examen parcial"*).

### ⏰ 4. Horario Semanal con Reloj Digital Integrado
* **Cuadrícula Compacta de 6 Días (Lunes a Sábado):** Organiza tus materias y aulas con ordenamiento cronológico automático.
* **Selector Digital de Horas:** Selector de tiempo estilo reloj digital con saltos configurados a intervalos de 15 minutos (ej. `17:30 - 18:15`).
* **Auto-completado Inteligente:** Vincula materias existentes y detecta automáticamente profesor y aula asignada.

### 🖼️ 5. Personalización de Portada y Perfil (Estilo Facebook)
* **Encuadre Directo en Pantalla:** Arrastra libremente tu banner sobre la interfaz para ajustar la posición visual.
* **2 Modos de Visualización:**
  * **Llenar & Mover (`Cover`):** Con soporte de zoom (100% a 250%).
  * **Ver Completa (`Contain`):** Fondo cinemático ambiental con desenfoque automático (`ambient glow`).
* **Estudio de Recorte Interactivo (`ImageCropper`):** Recuadro con 8 puntos de ajuste, cuadrícula de Regla de Tercios fotográfica, proporciones fijas (3:1, 16:9, 4:3, 1:1, Círculo) y soporte de GIFs animados.

### 🎯 6. Tablero de Tareas, Exámenes y Calificaciones
* **Gestor de Pendientes:** Control de tareas, proyectos, exámenes y quizes con semáforo de prioridad y fecha límite.
* **Celebración con Confeti:** Animaciones interactivas al completar entregas o aprobar materias.
* **Calculadora de Promedios:** Registro de parciales, examen final y ponderaciones mínimas aprobatorias.

---

## ⌨️ Atajos de Teclado del Sistema

| Atajo | Acción |
|---|---|
| <kbd>Ctrl</kbd> + <kbd>K</kbd> | 🔍 Abrir Paleta de Búsqueda Global instantánea |
| <kbd>Ctrl</kbd> + <kbd>B</kbd> | 📁 Colapsar / Expandir Barra Lateral (o Negrita dentro del editor) |
| <kbd>Ctrl</kbd> + <kbd>S</kbd> | 💾 Guardar apunte y crear punto de control |
| <kbd>Ctrl</kbd> + <kbd>Z</kbd> | ↩️ Deshacer último cambio |
| <kbd>Ctrl</kbd> + <kbd>Y</kbd> | ↪️ Rehacer cambio |

---

## 🛠️ Instalación y Ejecución Local

### Prerrequisitos
* [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
* [Git](https://git-scm.com/)

```bash
# 1. Clonar el repositorio
git clone https://github.com/eugeniocvz222-sketch/Sumire.git

# 2. Entrar a la carpeta
cd Sumire

# 3. Instalar dependencias
npm install

# 4. Iniciar en modo desarrollo
npm run dev
```

---

## 📦 Generar Instalador de Windows (.EXE)

Puedes empaquetar la aplicación en un instalador nativo de Windows o en una versión portable con un solo comando:

```bash
# Generar el Instalador de Windows (.exe con Asistente)
npm run app:installer

# Generar la versión Portable (Doble clic y abre directo, sin instalar)
npm run app:portable
```

> 📁 Los archivos `.exe` generados se guardan automáticamente en la carpeta `release/`.

---

## 🚀 Flujo de Releases Automáticos (Semantic Versioning)

Lanza y etiqueta nuevas versiones oficiales con compilación automática:

```bash
# Parche de correcciones (ej. v1.0.0 -> v1.0.1)
npm run release:patch

# Nueva funcionalidad (ej. v1.0.0 -> v1.1.0)
npm run release:minor

# Actualización mayor (ej. v1.0.0 -> v2.0.0)
npm run release:major
```

---

## 🧑‍💻 Autor y Créditos

* **Desarrollador:** [Eugenio Cavazos](https://github.com/eugeniocvz222-sketch)
* **Diseño & Componentes:** React 19, TipTap Editor, Tailwind CSS, Framer Motion & 21st.dev.

<div align="center">
  <br />
  Hecho con 💜 para estudiantes universitarios.
</div>
