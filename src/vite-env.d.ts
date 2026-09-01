/// <reference types="vite/client" />

interface ElectronAPI {
  getDefaultPath: () => Promise<string>
  selectFolder: () => Promise<string | null>
  saveData: (params: { folderPath: string; fileName: string; data: string }) => Promise<{ success: boolean; path?: string; error?: string }>
  loadData: (params: { folderPath: string; fileName: string }) => Promise<{ success: boolean; data?: string; error?: string }>
  exportMarkdown: (params: { defaultName: string; content: string }) => Promise<{ success: boolean; path?: string; error?: string; canceled?: boolean }>
}

interface Window {
  electronAPI?: ElectronAPI
}
