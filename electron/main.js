const { app, BrowserWindow, ipcMain, Menu, nativeTheme } = require('electron');
const path = require('path');
const fs = require('fs');

const DATA_PATH = path.join(app.getPath('userData'), 'habitlog-data.json');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 780,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0b0d10',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  // Graceful show
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Dev or production
  const isDev = !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

// Data persistence
function loadData() {
  try {
    if (fs.existsSync(DATA_PATH)) {
      return JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed to load data:', e);
  }
  return null;
}

function saveData(data) {
  try {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Failed to save data:', e);
    return false;
  }
}

// IPC handlers
ipcMain.handle('load-data', () => loadData());
ipcMain.handle('save-data', (_, data) => saveData(data));
ipcMain.handle('export-data', (_, data) => {
  const { dialog } = require('electron');
  return dialog.showSaveDialog(mainWindow, {
    defaultPath: `habitlog-export-${new Date().toISOString().slice(0,10)}.json`,
    filters: [{ name: 'JSON', extensions: ['json'] }],
  }).then(result => {
    if (!result.canceled && result.filePath) {
      fs.writeFileSync(result.filePath, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    }
    return false;
  });
});
ipcMain.handle('import-data', () => {
  const { dialog } = require('electron');
  return dialog.showOpenDialog(mainWindow, {
    filters: [{ name: 'JSON', extensions: ['json'] }],
    properties: ['openFile'],
  }).then(result => {
    if (!result.canceled && result.filePaths.length) {
      try {
        return JSON.parse(fs.readFileSync(result.filePaths[0], 'utf-8'));
      } catch (e) {
        return null;
      }
    }
    return null;
  });
});

// Window controls
ipcMain.on('window-minimize', () => mainWindow?.minimize());
ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) mainWindow.unmaximize();
  else mainWindow?.maximize();
});
ipcMain.on('window-close', () => mainWindow?.close());
ipcMain.handle('window-is-maximized', () => mainWindow?.isMaximized() ?? false);

mainWindow?.on('maximize', () => mainWindow.webContents.send('window-state-change', true));
mainWindow?.on('unmaximize', () => mainWindow.webContents.send('window-state-change', false));

app.whenReady().then(() => {
  createWindow();

  // Re-register events after window creation
  mainWindow.on('maximize', () => mainWindow.webContents.send('window-state-change', true));
  mainWindow.on('unmaximize', () => mainWindow.webContents.send('window-state-change', false));

  Menu.setApplicationMenu(null);
});

app.on('window-all-closed', () => {
  app.quit();
});
