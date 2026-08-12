const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const express = require('express');
const KeyAuth = require('./keyauth');

const externalKeyAuth = new KeyAuth({
  name: "PRRX EXTERNAL",
  ownerid: "7P1GTjNd76",
  version: "1.0",
});

const internalKeyAuth = new KeyAuth({
  name: "PRRX INTERNAL",
  ownerid: "7P1GTjNd76",
  version: "3.6",
});
let mainWindow;
let server;

function startServer() {
  return new Promise((resolve) => {
    const expressApp = express();
    expressApp.use(express.static(path.join(__dirname, 'www')));
    
    // We must use a fixed port so the origin (http://localhost:54321) remains constant.
    // If the port changes, the browser clears localStorage/IndexedDB and the user is logged out.
    const FIXED_PORT = 54321;
    server = expressApp.listen(FIXED_PORT, '127.0.0.1', () => {
      resolve(server.address().port);
    }).on('error', (err) => {
      // If the port is somehow in use, fall back to a random port (will lose login state for this session)
      server = expressApp.listen(0, '127.0.0.1', () => {
        resolve(server.address().port);
      });
    });
  });
}

async function createWindow() {
  const port = await startServer();

  // Create a small, frameless-like window for the launcher login
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    show: false,
    frame: false, // Frameless for sleek look
    transparent: true, // Transparent to allow CSS rounded corners to show
    hasShadow: true,
    resizable: false,
    maximizable: false,
    // Note: Do not set backgroundColor when using transparent: true
    icon: path.join(__dirname, 'www', 'logo.jpeg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  // Load the React app via localhost to bypass Firebase file:// domain restriction
  mainWindow.loadURL(`http://localhost:${port}/#/launcher`);

  // Intercept links to open in the user's default browser (e.g. Google Login popups if they somehow target _blank)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.includes('accounts.google.com') || url.includes('auth')) {
      // By returning 'allow', Electron opens an internal popup window for Google Login, 
      // which is typically what users expect for "in-app" auth popups.
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Remove standard windows menu bar
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  createWindow();

  app.on('browser-window-created', (e, window) => {
    window.setMenuBarVisibility(false);
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handler for when login is successful in React
ipcMain.on('login-success', () => {
  if (mainWindow) {
    // Enable resizing
    mainWindow.setResizable(true);
    mainWindow.setMaximizable(true);
    
    // Resize to the main dashboard size
    mainWindow.setSize(1280, 800, true);
    
    // Optionally restore the frame if you want a normal window title bar
    // Since frame cannot be changed dynamically on all OS, we can center it.
    mainWindow.center();
  }
});

// IPC handler to close the app from the custom UI
ipcMain.on('quit-app', () => {
  app.quit();
});

ipcMain.on('minimize-app', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('maximize-app', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('keyauth-login', async (event, { type, username, password }) => {
  try {
    const authApp = type === 'INTERNAL' ? internalKeyAuth : externalKeyAuth;
    await authApp.init();
    const result = await authApp.login(username, password);
    return { success: true, user: authApp.user_data };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('keyauth-license', async (event, { type, license }) => {
  try {
    const authApp = type === 'INTERNAL' ? internalKeyAuth : externalKeyAuth;
    await authApp.init();
    const result = await authApp.license(license);
    return { success: true, user: authApp.user_data };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

