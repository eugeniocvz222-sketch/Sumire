import { contextBridge, ipcRenderer } from 'electron'

export interface ElectronAPI {
  getDefaultPath: () => Promise<string>
  selectFolder: () => Promise<string | null>
  saveData: (params: { folderPath: string; fileName: string; data: string }) => Promise<{ success: boolean; path?: string; error?: string }>
  loadData: (params: { folderPath: string; fileName: string }) => Promise<{ success: boolean; data?: string; error?: string }>
  exportMarkdown: (params: { defaultName: string; content: string }) => Promise<{ success: boolean; path?: string; error?: string; canceled?: boolean }>
}

const electronAPI: ElectronAPI = {
  getDefaultPath: () => ipcRenderer.invoke('app:getDefaultPath'),
  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
  saveData: (params) => ipcRenderer.invoke('fs:saveData', params),
  loadData: (params) => ipcRenderer.invoke('fs:loadData', params),
  exportMarkdown: (params) => ipcRenderer.invoke('fs:exportMarkdown', params),
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)
