import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execSync } from 'node:child_process'

const bumpType = process.argv[2] || 'patch' // 'patch' | 'minor' | 'major' | explicit version (e.g. '1.0.1')

const packageJsonPath = path.join(process.cwd(), 'package.json')
const changelogPath = path.join(process.cwd(), 'CHANGELOG.md')

if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ Error: No se encontró package.json en el directorio actual.')
  process.exit(1)
}

const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
const currentVersion = pkg.version || '1.0.0'

// 1. Calculate next version
function getNextVersion(current, type) {
  if (['patch', 'minor', 'major'].includes(type)) {
    const parts = current.split('.').map((n) => parseInt(n, 10))
    if (parts.length !== 3 || parts.some(isNaN)) {
      return '1.0.1'
    }
    if (type === 'major') {
      return `${parts[0] + 1}.0.0`
    } else if (type === 'minor') {
      return `${parts[0]}.${parts[1] + 1}.0`
    } else {
      return `${parts[0]}.${parts[1]}.${parts[2] + 1}`
    }
  }
  // If user passed a direct version like "1.1.0"
  if (/^\d+\.\d+\.\d+$/.test(type)) {
    return type
  }
  return '1.0.1'
}

const nextVersion = getNextVersion(currentVersion, bumpType)
const releaseDate = new Date().toISOString().split('T')[0]

console.log(`\n======================================================`)
console.log(`🌸 Lanzamiento de Release Automático: Sumire Apuntes`)
console.log(`======================================================`)
console.log(`📌 Versión actual: v${currentVersion}`)
console.log(`✨ Nueva versión:  v${nextVersion} (${bumpType})`)
console.log(`📅 Fecha:          ${releaseDate}\n`)

// 2. Update package.json
pkg.version = nextVersion
fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8')
console.log(`✔ package.json actualizado a v${nextVersion}`)

// 3. Update CHANGELOG.md
if (fs.existsSync(changelogPath)) {
  let changelog = fs.readFileSync(changelogPath, 'utf-8')
  const newEntry = `\n## 🌟 [${nextVersion}] - ${releaseDate}\n\n### 🛠️ Actualizaciones y Mejoras\n* Lanzamiento de la versión v${nextVersion} con mejoras de estabilidad, rendimiento y correcciones generales.\n`

  if (changelog.includes('## 🌟 [')) {
    changelog = changelog.replace('## 🌟 [', newEntry + '\n## 🌟 [')
  } else {
    changelog += newEntry
  }
  fs.writeFileSync(changelogPath, changelog, 'utf-8')
  console.log(`✔ CHANGELOG.md actualizado con la entrada v${nextVersion}`)
}

// 4. Git commit & tag
try {
  console.log(`\n📦 Creando commit y tag en Git...`)
  execSync('git add .', { stdio: 'inherit' })
  execSync(`git commit -m "chore(release): v${nextVersion}"`, { stdio: 'inherit' })
  execSync(`git tag -a v${nextVersion} -m "Release v${nextVersion}"`, { stdio: 'inherit' })
  console.log(`✔ Git commit y Tag v${nextVersion} creados con éxito.`)
} catch (err) {
  console.log('ℹ Nota: Git commit omitido o ya actualizado.')
}

// 5. Build Windows installer .exe
console.log(`\n🚀 Compilando instalador .exe para la versión v${nextVersion}...`)
const tempOut = path.join(os.tmpdir(), 'sumire-build')
if (fs.existsSync(tempOut)) {
  try {
    fs.rmSync(tempOut, { recursive: true, force: true })
  } catch (e) {}
}

execSync('npm run build', { stdio: 'inherit' })
execSync(
  `npx electron-builder --win nsis --config.directories.output="${tempOut.replace(/\\/g, '/')}"`,
  { stdio: 'inherit' }
)

const releaseDir = path.join(process.cwd(), 'release')
if (!fs.existsSync(releaseDir)) {
  fs.mkdirSync(releaseDir, { recursive: true })
}

const exeFiles = fs.readdirSync(tempOut).filter((f) => f.endsWith('.exe'))
for (const file of exeFiles) {
  const src = path.join(tempOut, file)
  const dest = path.join(releaseDir, file)
  fs.copyFileSync(src, dest)
  const sizeMb = (fs.statSync(dest).size / (1024 * 1024)).toFixed(1)
  console.log(`\n🎉 ¡RELEASE v${nextVersion} COMPLETADO CON ÉXITO!`)
  console.log(`📁 Instalador generado: release/${file} (${sizeMb} MB)`)
  console.log(`🏷  Git Tag: v${nextVersion}\n`)
}
