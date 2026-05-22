const { app, BrowserWindow, dialog, ipcMain } = require('electron')
const fs = require('node:fs')
const path = require('node:path')
const { pathToFileURL } = require('node:url')

let mainWindow = null

const audioFilters = [
  {
    name: '音频',
    extensions: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'webm'],
  },
]

const audioExtensions = new Set(audioFilters[0].extensions)

function toAudioFile(filePath) {
  const stat = fs.statSync(filePath)
  return {
    path: filePath,
    url: pathToFileURL(filePath).href,
    name: path.basename(filePath),
    size: stat.size,
  }
}

function collectAudioFiles(directory) {
  const results = []
  const entries = fs.readdirSync(directory, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.name.startsWith('.')) {
      continue
    }

    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      results.push(...collectAudioFiles(entryPath))
      continue
    }

    if (entry.isFile()) {
      const extension = path.extname(entry.name).slice(1).toLowerCase()
      if (audioExtensions.has(extension)) {
        results.push(toAudioFile(entryPath))
      }
    }
  }

  return results.sort((left, right) =>
    left.name.localeCompare(right.name, 'zh-Hans-CN', { numeric: true, sensitivity: 'base' }),
  )
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 760,
    minHeight: 520,
    show: false,
    title: '像素音浪姬',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    backgroundColor: '#070611',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  const devServerUrl = process.env.VITE_DEV_SERVER_URL
  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl)
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('audio:open', async () => {
  if (!mainWindow) {
    return []
  }

  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择音乐文件',
    properties: ['openFile', 'multiSelections'],
    filters: audioFilters,
  })

  if (result.canceled) {
    return []
  }

  return result.filePaths.map((filePath) => ({
    ...toAudioFile(filePath),
  }))
})

ipcMain.handle('audio:open-folder', async () => {
  if (!mainWindow) {
    return []
  }

  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择音乐文件夹',
    properties: ['openDirectory'],
  })

  if (result.canceled || result.filePaths.length === 0) {
    return []
  }

  return collectAudioFiles(result.filePaths[0])
})
