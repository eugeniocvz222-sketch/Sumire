import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const isPortable = process.argv.includes('--portable')
const targetType = isPortable ? 'portable' : 'nsis'

console.log(`\n🚀 Compilando Sumire Apuntes (${targetType.toUpperCase()})...\n`)

// 1. Run frontend + electron build
execSync('npm run build', { stdio: 'inherit' })

// 2. Define temp output directory outside OneDrive to prevent lockups
const tempOut = path.join(os.tmpdir(), 'sumire-build')
if (fs.existsSync(tempOut)) {
  try {
    fs.rmSync(tempOut, { recursive: true, force: true })
  } catch (e) {}
}

// 3. Run electron-builder
console.log(`\n📦 Empaquetando instalador de Windows...`)
execSync(
  `npx electron-builder --win ${targetType} --config.directories.output="${tempOut.replace(/\\/g, '/')}"`,
  { stdio: 'inherit' }
)

// 4. Copy resulting .exe to release/
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
  console.log(`\n✅ ¡Ejecutable generado con éxito!`)
  console.log(`📁 Ubicación: release/${file} (${sizeMb} MB)`)
}
