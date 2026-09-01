# 📋 Historial de Versiones (Changelog) - Sumire Apuntes

Todos los cambios notables, nuevas características y correcciones de este proyecto se documentan en este archivo siguiendo [Semantic Versioning](https://semver.org/).

---

## 🌟 [1.0.0] - 2026-09-01 (Lanzamiento Beta Oficial)

### 🚀 Nuevas Características Principales
* **📖 Libretas Digitales 3D:**
  * Componente `Book3D` con física de rotación, lomo con relieve, textura de páginas y listón marcapáginas.
  * Estudio de personalización en tiempo real (`NewSubjectModal`) con previsualización en vivo e inspección en 3D.
  * 6 patrones táctiles de portada (*Minimal*, *Cuadrícula Técnica*, *Blueprint*, *Matriz de Puntos*, *Ondas Japonesas*, *Cyber Grid*).
* **⏰ Horario Semanal con Reloj Digital:**
  * Cuadrícula por días (Lunes a Sábado) con selector digital de horas y minutos a intervalos de 15 min.
  * Vinculación automática con materias, aula y profesores.
* **🖼️ Estudio de Recorte & Encuadre de Portada (Estilo Facebook):**
  * Reposicionamiento directo en vivo sobre el banner (arrastrar para encuadrar).
  * 2 modos de visualización: **Llenar & Mover (`Cover`)** y **Ver Completa (`Contain` con fondo cinemático desenfocado)**.
  * Selector de altura de banner: *Compacta*, *Normal*, *Cinemática* y *Grande*.
  * Recortador interactivo con 8 manejadores y regla de tercios (`ImageCropper`).
  * Soporte completo de GIFs animados en avatar y portada con auto-limpieza de espacio.
* **✍️ Editor de Apuntes Universitario:**
  * Editor enriquecido TipTap con títulos, listas de tareas interactivas, fórmulas y bloques de código.
  * Barra de herramientas reactiva con sincronización de selección en tiempo real.
  * Auto-guardado local instantáneo y exportación a Markdown (`.md`).
* **🌸 Onboarding Dialog Interactivo:**
  * Tutorial guiado paso a paso para usuarios nuevos con catálogo de atajos de teclado (`Ctrl+K`, `Ctrl+B`, `Ctrl+S`, `Ctrl+P`).
* **📦 Empaquetador a Ejecutable de Windows:**
  * Soporte para generar instaladores `.exe` (`NSIS`) y versiones portables con Electron Builder.

### 🛡️ Seguridad & Rendimiento
* Aislamiento total de datos por usuario (`User Data Scoping`).
* Purga automática de datos ficticios de prueba (`sanitizeData`).
* Conexión local Offline-First + soporte de base de datos PostgreSQL.
