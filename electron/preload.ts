import { contextBridge, ipcRenderer } from 'electron'

export interface UpdateStatusData {
  status: 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error'
  info?: any
  percent?: number
  error?: string
}

export interface ElectronAPI {
  getDefaultPath: () => Promise<string>
  selectFolder: () => Promise<string | null>
  saveData: (params: { folderPath: string; fileName: string; data: string }) => Promise<{ success: boolean; path?: string; error?: string }>
  loadData: (params: { folderPath: string; fileName: string }) => Promise<{ success: boolean; data?: string; error?: string }>
  exportMarkdown: (params: { defaultName: string; content: string }) => Promise<{ success: boolean; path?: string; error?: string; canceled?: boolean }>
  checkForUpdates: () => Promise<{ success: boolean; message?: string; error?: string }>
  restartAndInstall: () => void
  onUpdateStatus: (callback: (data: UpdateStatusData) => void) => () => void
}

const electronAPI: ElectronAPI = {
  getDefaultPath: () => ipcRenderer.invoke('app:getDefaultPath'),
  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
  saveData: (params) => ipcRenderer.invoke('fs:saveData', params),
  loadData: (params) => ipcRenderer.invoke('fs:loadData', params),
  exportMarkdown: (params) => ipcRenderer.invoke('fs:exportMarkdown', params),
  checkForUpdates: () => ipcRenderer.invoke('app:checkForUpdates'),
  restartAndInstall: () => ipcRenderer.send('app:restartAndInstall'),
  onUpdateStatus: (callback) => {
    const handler = (_: any, data: UpdateStatusData) => callback(data)
    ipcRenderer.on('updater:status', handler)
    return () => {
      ipcRenderer.removeListener('updater:status', handler)
    }
  },
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
