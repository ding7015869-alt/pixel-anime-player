const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('pixelStage', {
  openAudioFiles: () => ipcRenderer.invoke('audio:open'),
  openAudioFolder: () => ipcRenderer.invoke('audio:open-folder'),
})
