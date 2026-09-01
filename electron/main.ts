import 'dotenv/config'
import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { autoUpdater } from 'electron-updater'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public')

let win: BrowserWindow | null

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function setupAutoUpdater(mainWindow: BrowserWindow) {
  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    mainWindow.webContents.send('updater:status', { status: 'checking' })
  })

  autoUpdater.on('update-available', (info) => {
    mainWindow.webContents.send('updater:status', { status: 'available', info })
  })

  autoUpdater.on('update-not-available', (info) => {
    mainWindow.webContents.send('updater:status', { status: 'not-available', info })
  })

  autoUpdater.on('download-progress', (progressObj) => {
    mainWindow.webContents.send('updater:status', {
      status: 'downloading',
      percent: Math.round(progressObj.percent),
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    mainWindow.webContents.send('updater:status', { status: 'downloaded', info })
  })

  autoUpdater.on('error', (err) => {
    mainWindow.webContents.send('updater:status', {
      status: 'error',
      error: err == null ? 'unknown' : (err.message || err).toString(),
    })
  })

  // Check for updates automatically in production after window opens
  if (app.isPackaged) {
    setTimeout(() => {
      autoUpdater.checkForUpdatesAndNotify().catch((err) => {
        console.error('AutoUpdater check error:', err)
      })
    }, 4000)
  }
}

function getAppIconPath(): string {
  const publicDir = process.env.VITE_PUBLIC || path.join(__dirname, '../public')
  const icoPath = path.join(publicDir, 'icon.ico')
  const pngPath = path.join(publicDir, 'icon.png')
  const mascotPng = path.join(publicDir, 'apuntes_mascot.png')

  if (process.platform === 'win32' && fs.existsSync(icoPath)) {
    return icoPath
  }
  if (fs.existsSync(pngPath)) {
    return pngPath
  }
  return mascotPng
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 600,
    title: 'Sumire Apuntes',
    backgroundColor: '#0b0f19',
    icon: getAppIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(process.env.DIST || '', 'index.html'))
  }

  setupAutoUpdater(win)
}

// Ensure default notes directory exists
function getDefaultNotesDir(): string {
  const userDocs = app.getPath('documents')
  const defaultDir = path.join(userDocs, 'ApuntesUniversitarios')
  if (!fs.existsSync(defaultDir)) {
    try {
      fs.mkdirSync(defaultDir, { recursive: true })
    } catch (err) {
      console.error('Error creating default directory:', err)
    }
  }
  return defaultDir
}

// IPC Handlers
ipcMain.handle('app:getDefaultPath', () => {
  return getDefaultNotesDir()
})

ipcMain.handle('dialog:selectFolder', async () => {
  if (!win) return null
  const result = await dialog.showOpenDialog(win, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Seleccionar carpeta de apuntes (ej. en OneDrive o Documentos)',
  })
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0]
  }
  return null
})

ipcMain.handle('fs:saveData', async (_, { folderPath, fileName, data }: { folderPath: string; fileName: string; data: string }) => {
  try {
    const targetDir = folderPath || getDefaultNotesDir()
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }
    const filePath = path.join(targetDir, fileName)
    fs.writeFileSync(filePath, data, 'utf-8')
    return { success: true, path: filePath }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, error: message }
  }
})

ipcMain.handle('fs:loadData', async (_, { folderPath, fileName }: { folderPath: string; fileName: string }) => {
  try {
    const targetDir = folderPath || getDefaultNotesDir()
    const filePath = path.join(targetDir, fileName)
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8')
      return { success: true, data: content }
    }
    return { success: false, error: 'File not found' }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return { success: false, error: message }
  }
})

ipcMain.handle('fs:exportMarkdown', async (_, { defaultName, content }: { defaultName: string; content: string }) => {
  if (!win) return { success: false }
  const result = await dialog.showSaveDialog(win, {
    defaultPath: defaultName,
    filters: [{ name: 'Markdown', extensions: ['md'] }, { name: 'Texto', extensions: ['txt'] }],
  })
  if (!result.canceled && result.filePath) {
    try {
      fs.writeFileSync(result.filePath, content, 'utf-8')
      return { success: true, path: result.filePath }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error)
      return { success: false, error: message }
    }
  }
  return { success: false, canceled: true }
})

ipcMain.handle('app:checkForUpdates', async () => {
  if (!app.isPackaged) {
    return { success: false, message: 'En modo desarrollo no se comprueban actualizaciones' }
  }
  try {
    const result = await autoUpdater.checkForUpdates()
    return { success: true, result }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
})

ipcMain.on('app:restartAndInstall', () => {
  autoUpdater.quitAndInstall()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
