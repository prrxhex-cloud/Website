const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  // Create a small, frameless-like window for the launcher login
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    show: false,
    frame: false, // We'll make it frameless for that sleek launcher look, or just unresizable
    resizable: false,
    maximizable: false,
    backgroundColor: '#0a0a0f',
    icon: path.join(__dirname, 'www', 'logo.jpeg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  // Load the React app. It will route to #/launcher due to our App.jsx logic
  mainWindow.loadFile(path.join(__dirname, 'www', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Remove standard windows menu bar
  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  createWindow();

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
