const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const express = require('express');
const KeyAuth = require('./keyauth');
const { startAntiDebug } = require('./antidebug');
const fs = require('fs');
const os = require('os');
const https = require('https');
const { spawn } = require('child_process');
const DiscordRPC = require('discord-rpc');

// CRITICAL: Force GPU Hardware Acceleration for Low-End PCs
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');

// CRITICAL: Protect user data by enforcing AppData directory securely
app.setPath('userData', path.join(app.getPath('appData'), 'PRRX_HEX'));

// We will defer anti-debug startup to prevent blocking the UI thread
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
    server = expressApp.listen(FIXED_PORT, '127.0.0.1', function() {
      resolve(this.address().port);
    }).on('error', (err) => {
      // If the port is somehow in use, fall back to a random port (will lose login state for this session)
      server = expressApp.listen(0, '127.0.0.1', function() {
        resolve(this.address().port);
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
    icon: path.join(__dirname, 'www', 'icon.ico'),
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
  // Defer heavy anti-debug scripts to let the UI render instantly
  setTimeout(() => {
    startAntiDebug();
  }, 2000);

  createWindow();

  app.on('browser-window-created', (e, window) => {
    window.setMenuBarVisibility(false);
    // Prevent DevTools from opening
    window.webContents.on('devtools-opened', () => {
      window.webContents.closeDevTools();
      // Optionally forcefully close the window as a penalty
      // window.close();
    });
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

// Auto-Updater IPC Handler
ipcMain.handle('download-and-install-update', async (event, url) => {
  return new Promise((resolve) => {
    try {
      const installerPath = path.join(os.tmpdir(), 'PRRX_HEX_Update.exe');
      const fileStream = fs.createWriteStream(installerPath);

      https.get(url, (response) => {
        // Handle redirects if necessary (GitHub releases usually redirect)
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          https.get(response.headers.location, handleResponse);
        } else {
          handleResponse(response);
        }

        function handleResponse(res) {
          if (res.statusCode !== 200) {
            resolve({ success: false, error: `Server responded with status code: ${res.statusCode}` });
            return;
          }

          res.pipe(fileStream);

          fileStream.on('finish', () => {
            fileStream.close(() => {
              // Spawn the installer detached so it survives the app exit
              const subprocess = spawn(installerPath, [], {
                detached: true,
                stdio: 'ignore'
              });
              
              subprocess.unref();

              // Quit application to release file locks for the installer
              app.quit();
              
              resolve({ success: true });
            });
          });
        }
      }).on('error', (err) => {
        fs.unlink(installerPath, () => {});
        resolve({ success: false, error: err.message });
      });
    } catch (err) {
      resolve({ success: false, error: err.message });
    }
  });
});

// Background Downloader (Does not install automatically)
ipcMain.handle('download-update-background', async (event, url) => {
  return new Promise((resolve) => {
    try {
      const installerPath = path.join(os.tmpdir(), 'PRRX_HEX_Background_Update.exe');
      const fileStream = fs.createWriteStream(installerPath);

      https.get(url, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          https.get(response.headers.location, handleResponse);
        } else {
          handleResponse(response);
        }

        function handleResponse(res) {
          if (res.statusCode !== 200) {
            resolve({ success: false, error: `Server responded with status code: ${res.statusCode}` });
            return;
          }
          res.pipe(fileStream);
          fileStream.on('finish', () => {
            fileStream.close(() => {
              // Return the path so it can be installed later
              resolve({ success: true, path: installerPath });
            });
          });
        }
      }).on('error', (err) => {
        fs.unlink(installerPath, () => {});
        resolve({ success: false, error: err.message });
      });
    } catch (err) {
      resolve({ success: false, error: err.message });
    }
  });
});

// Execute the background downloaded update
ipcMain.handle('install-update-background', async (event, installerPath) => {
  try {
    if (!fs.existsSync(installerPath)) {
      return { success: false, error: "Installer file not found." };
    }
    const subprocess = spawn(installerPath, [], {
      detached: true,
      stdio: 'ignore'
    });
    subprocess.unref();
    app.quit();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// File Dialog to select an executable / application
ipcMain.handle('select-executable', async () => {
  const { dialog } = require('electron');
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Panel / Game Executable',
    filters: [
      { name: 'Executable Files', extensions: ['exe', 'bat', 'cmd', 'lnk'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['openFile']
  });
  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

let appMonitorInterval = null;

function startAppMonitor(filePath) {
  if (appMonitorInterval) {
    clearInterval(appMonitorInterval);
    appMonitorInterval = null;
  }

  const fileName = path.basename(filePath);
  const { exec } = require('child_process');

  let seenRunning = false;
  let checksCount = 0;

  // Poll every 1 second for rapid detection
  appMonitorInterval = setInterval(() => {
    checksCount++;
    exec(`tasklist /FI "IMAGENAME eq ${fileName}" /NH`, (err, stdout) => {
      if (err) return;
      const text = (stdout || '').toLowerCase();
      const isRunning = text.includes(fileName.toLowerCase());

      if (isRunning) {
        seenRunning = true;
      } else {
        // If it was running and has now exited, or if 6 seconds passed and not found
        if (seenRunning || checksCount > 6) {
          clearInterval(appMonitorInterval);
          appMonitorInterval = null;
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('executable-closed', {
              filePath,
              fileName
            });
          }
        }
      }
    });
  }, 1000);
}

// Stop / Terminate Running Executable
ipcMain.handle('stop-executable', async (event, filePath) => {
  if (appMonitorInterval) {
    clearInterval(appMonitorInterval);
    appMonitorInterval = null;
  }
  if (filePath) {
    const fileName = path.basename(filePath);
    const { exec } = require('child_process');
    exec(`taskkill /F /IM "${fileName}" /T`, () => {});
  }
  return { success: true };
});

// Launch Emulator with Real System & FPS Optimization Batch Files
ipcMain.handle('launch-emulator-and-optimize', async (event, { emulatorPath, emulatorName }) => {
  const { exec, spawn } = require('child_process');
  
  // Optimizer batch files location
  const optimizersDir = path.join(__dirname, 'optimizers');
  const tempOptimizersDir = path.join(app.getPath('temp'), 'PRRX_OPTIMIZERS');
  
  try {
    if (!fs.existsSync(tempOptimizersDir)) {
      fs.mkdirSync(tempOptimizersDir, { recursive: true });
    }
    
    // Copy optimizer files to temp directory for reliable execution
    const batFiles = [
      'PRRX_MAIN_OPTIMIZER.bat',
      'PRRX_NETWORK_TUNER.bat',
      'PRRX_MEMORY_TRIMMER.bat',
      'PRRX_EMULATOR_BYPASS.bat'
    ];
    
    batFiles.forEach(file => {
      const src = path.join(optimizersDir, file);
      const dest = path.join(tempOptimizersDir, file);
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      }
    });

    // Run the 4 batch files in parallel as Admin
    batFiles.forEach((file, index) => {
      const batPath = path.join(tempOptimizersDir, file);
      if (fs.existsSync(batPath)) {
        setTimeout(() => {
          const escapedBat = batPath.replace(/'/g, "''");
          const batPs = `Start-Process -FilePath '${escapedBat}' -Verb RunAs`;
          exec(`powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "${batPs}"`, () => {});
        }, index * 250);
      }
    });

  } catch (err) {
    console.error("Optimizer batch launch error:", err);
  }

  // Launch the selected emulator as Administrator if path exists
  if (emulatorPath && fs.existsSync(emulatorPath)) {
    const emuDir = path.dirname(emulatorPath);
    const escapedEmu = emulatorPath.replace(/'/g, "''");
    const escapedDir = emuDir.replace(/'/g, "''");
    const emuPs = `Start-Process -FilePath '${escapedEmu}' -WorkingDirectory '${escapedDir}' -Verb RunAs`;
    
    setTimeout(() => {
      exec(`powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command "${emuPs}"`, (err) => {
        if (err) {
          shell.openPath(emulatorPath);
        }
      });
    }, 1500);

    return { success: true, message: `${emulatorName || 'Emulator'} launched with PRRX Real Optimization batch scripts!` };
  } else {
    return { success: true, message: `PRRX Real Optimization batch scripts executed! (${emulatorName || 'Emulator'} path not found on disk)` };
  }
});

// Launch selected executable with Full Administrator Privileges (Run As Admin)
ipcMain.handle('launch-executable-as-admin', async (event, filePath) => {
  if (!filePath || !fs.existsSync(filePath)) {
    return { success: false, message: 'Selected application path does not exist.' };
  }

  const fileDir = path.dirname(filePath);

  return new Promise((resolve) => {
    // 1. Try launching with elevated administrator privileges (RunAs) and proper working directory
    const escapedPath = filePath.replace(/'/g, "''");
    const escapedDir = fileDir.replace(/'/g, "''");
    const psCommand = `Start-Process -FilePath '${escapedPath}' -WorkingDirectory '${escapedDir}' -Verb RunAs`;

    const { exec } = require('child_process');
    exec(`powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command "${psCommand}"`, (error, stdout, stderr) => {
      if (error) {
        console.warn("RunAs launch returned warning/error, attempting direct execution fallback:", error.message);
        
        // Fallback: Launch directly using spawn with working directory
        try {
          const fallbackChild = spawn(filePath, [], {
            cwd: fileDir,
            detached: true,
            stdio: 'ignore',
            shell: true
          });
          fallbackChild.unref();
          startAppMonitor(filePath);
          resolve({ success: true, message: 'Application launched with default permissions (RunAs bypassed).' });
        } catch (fallbackErr) {
          shell.openPath(filePath);
          startAppMonitor(filePath);
          resolve({ success: true, message: 'Application opened via Windows Shell.' });
        }
      } else {
        startAppMonitor(filePath);
        resolve({ success: true, message: 'Application successfully launched with Full Administrator Privileges!' });
      }
    });
  });
});

// ==========================================
// DISCORD RPC SETUP
// ==========================================
const clientId = '1537775256175902792';
DiscordRPC.register(clientId);
let rpc = new DiscordRPC.Client({ transport: 'ipc' });
const startTimestamp = new Date();
let rpcEnabled = true; // Default state
let rpcReady = false;
let currentRPCUser = "Guest";

async function setActivity() {
  if (!rpc || !rpcEnabled || !rpcReady) return;
  
  try {
    rpc.setActivity({
      details: "Username: " + currentRPCUser + " | Expiry: " + currentRPCExpiry,
      state: "discord.gg/EuwhvXXfJC",
      startTimestamp,
      largeImageKey: "logo", // Ensure your uploaded JPEG in the portal is named 'logo'
      largeImageText: "PRRX HEX",
      instance: false,
      buttons: [
        { label: "<3 Buying Here !", url: "https://wa.me/+94761386077" },
        { label: "Website", url: "https://prrxhex-cloud.github.io/Website/" }
      ]
    }).catch(console.error);
  } catch (err) {
    console.error("RPC Error:", err);
  }
}

rpc.on('ready', () => {
  rpcReady = true;
  setActivity();
});

// Attempt login non-blocking
rpc.login({ clientId }).catch(console.error);

ipcMain.on('update-discord-rpc-user', (event, username, expiry) => {
  if (username) {
    currentRPCUser = username;
    if (expiry) currentRPCExpiry = expiry;
    setActivity();
  }
});

ipcMain.on('discord-rpc-toggle', (event, enabled) => {
  rpcEnabled = enabled;
  if (enabled) {
    if (!rpcReady) {
      rpc.login({ clientId }).catch(console.error);
    } else {
      setActivity();
    }
  } else {
    if (rpcReady) {
      rpc.clearActivity().catch(console.error);
      rpc.destroy().catch(console.error);
    }
    rpcReady = false;
    // Re-initialize client so it can be turned back on later
    rpc = new DiscordRPC.Client({ transport: 'ipc' });
    rpc.on('ready', () => {
      rpcReady = true;
      if (rpcEnabled) setActivity();
    });
  }
});
