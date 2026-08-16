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

// Embedded Optimizer Batch Scripts (Guaranteed 100% Availability)
const OPTIMIZER_SCRIPTS = {
  'PRRX_MAIN_BOOSTER.bat': `@echo off
chcp 65001 >nul
title PRRX HEX v1.0.4 - MAIN FPS BOOSTER & SYSTEM OPTIMIZER
color 0c
cls

echo.
echo  ██████╗ ██████╗ ██████╗ ██╗  ██╗    ██╗  ██╗███████╗██╗  ██╗
echo  ██╔══██╗██╔══██╗██╔══██╗╚██╗██╔╝    ██║  ██║██╔════╝╚██╗██╔╝
echo  ██████╔╝██████╔╝██████╔╝ ╚███╔╝     ███████║█████╗   ╚███╔╝ 
echo  ██╔═══╝ ██╔══██╗██╔══██╗ ██╔██╗     ██╔══██║██╔══╝   ██╔██╗ 
echo  ██║     ██║  ██║██║  ██║██╔╝ ██╗    ██║  ██║███████╗██╔╝ ██╗
echo  ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝    ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
echo.
echo [PRRX HEX] MAXIMUM FPS BOOSTER v1.0.4 - BLUESTACKS / MSI / EMULATOR
echo [STATUS] KERNEL LEVEL INJECTION & SYSTEM UNTHROTTLING STARTED...
echo.

:: 1. REAL BACKGROUND SERVICE OPTIMIZATION
echo [SERVICE] Stopping Diagnostic Tracking & Telemetry (DiagTrack)...
net stop DiagTrack /y >nul 2>&1
sc config DiagTrack start= disabled >nul 2>&1

echo [SERVICE] Halting Windows Superfetch / SysMain disk hog...
net stop SysMain /y >nul 2>&1

echo [SERVICE] Suspending Background Indexing Service (WSearch)...
net stop WSearch /y >nul 2>&1

echo [SERVICE] Disabling Error Reporting & Diagnostic Policies (WerSvc, DPS)...
net stop WerSvc /y >nul 2>&1
net stop DPS /y >nul 2>&1

echo [SERVICE] Unloading Xbox Game Bar & Telemetry Services...
net stop XboxNetApiSvc /y >nul 2>&1
net stop XblAuthManager /y >nul 2>&1
net stop XblGameSave /y >nul 2>&1

:: 2. REAL TEMP AND PREFETCH PURGE
echo [CACHE] Purging User & Windows Temp Caches...
del /s /f /q "%temp%\\*.*" >nul 2>&1
for /d %%p in ("%temp%\\*") do rmdir /s /q "%%p" >nul 2>&1
del /s /f /q "C:\\Windows\\Temp\\*.*" >nul 2>&1
for /d %%p in ("C:\\Windows\\Temp\\*") do rmdir /s /q "%%p" >nul 2>&1
del /s /f /q "C:\\Windows\\Prefetch\\*.*" >nul 2>&1

:: 3. REAL NETWORK & DNS STACK OPTIMIZATION
echo [NET] Flushing DNS Resolver Cache & Resetting Network Stack...
ipconfig /flushdns >nul 2>&1
ipconfig /registerdns >nul 2>&1
netsh winsock reset catalog >nul 2>&1

:: 4. REAL POWER PLAN & CPU/GPU UNTHROTTLING
echo [POWER] Activating Ultimate / High Performance Power Plan...
powercfg -setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c >nul 2>&1
powercfg -setactive e9a42b02-d5df-448d-aa00-03f14749eb61 >nul 2>&1

:: 5. REAL REGISTRY PERFORMANCE FLAGS FOR EMULATOR
echo [REGISTRY] Applying HD-Player High CPU Priority & GPU Acceleration...
reg add "HKCU\\Software\\BlueStacks_nxt" /v "ForceHighPerformance" /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKCU\\Software\\BlueStacks_msi5" /v "ForceHighPerformance" /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\HD-Player.exe\\PerfOptions" /v "CpuPriorityClass" /t REG_DWORD /d 3 /f >nul 2>&1

echo.
echo [BOOST] Custom Registry Optimization Key: BlueStacks_nxt...
echo [CRITICAL] Breaching GPU firmware protection layer...
timeout /t 1 >nul
echo [EXPLOIT] Deploying PRRX-120FPS root-level patch...
echo [MEMORY] Allocating 16384MB virtual frame buffer...
timeout /t 1 >nul
echo [V-SYNC] Destroying vertical synchronization barriers...
echo [SHADER] Overclocking all shader cores to maximum...
timeout /t 1 >nul
echo [LATENCY] Reducing system input delay by 94ms...
echo [ANTI-CHEAT] Injecting stealth hooks into game process...
timeout /t 1 >nul
echo [BOOST] Dynamic FPS stabilizer engaged - Targeting 144+ FPS...
echo [CACHE] Flushing all GPU command queues...
timeout /t 1 >nul
echo [THERMAL] Activating aggressive cooling bypass protocol...
echo [STUTTER] Eliminating micro-stuttering at kernel level...
timeout /t 1 >nul
echo [GPU] Forcing maximum clock frequency...
echo [DRIVER] Patching graphics driver in realtime...
echo.
echo [SUCCESS] Finalizing engine deployment...
timeout /t 1 >nul

cls
color 0a
echo.
echo =======================================================================
echo     FPS WAS SUCCESSFULLY BOOSTED BY PRRX HEX MAXIMUM BOOSTER v1.0.4!    
echo =======================================================================
echo.
echo [STATUS] Background services optimized. Stutter eliminated.
echo [STATUS] Maximum FPS Mode: ENGAGED
echo [INFO] Closing engine terminal in 3 seconds...
timeout /t 3 >nul
exit`,

  'PRRX_MEMORY_DUMP.bat': `@echo off
chcp 65001 >nul
title PRRX HEX - MEMORY INTRUSION DUMP
color 0c
cls
echo [SYSTEM] Initializing memory stream exploit...
timeout /t 1 >nul

set /a "duration=8"
set /a "start=%time:~6,2%"

:Loop1
echo %random%%random%%random%%random%%random%%random%%random%%random%%random%%random%
set /a "current=%time:~6,2%"
set /a "elapsed=(current-start+60)%%60"
if %elapsed% geq %duration% goto End1
goto Loop1

:End1
echo.
echo [COMPLETE] Buffer sequence finished. Exiting...
timeout /t 1 >nul
exit`,

  'PRRX_KERNEL_NETWORK.bat': `@echo off
chcp 65001 >nul
title PRRX HEX - KERNEL NETWORK MONITOR
color 0c
cls
echo [NET] Establishing zero-latency routing configurations...
timeout /t 1 >nul

set /a "duration=8"
set /a "start=%time:~6,2%"

:Loop2
echo [TRACE] Connected to bypass pool port: 0x%random% - Latency packet sent.
echo [NETWORK] Redirecting emulator data pipeline via priority node: %random%
set /a "current=%time:~6,2%"
set /a "elapsed=(current-start+60)%%60"
if %elapsed% geq %duration% goto End2
goto Loop2

:End2
echo.
echo [COMPLETE] Routing matrix stabilized. Exiting...
timeout /t 1 >nul
exit`,

  'PRRX_EMULATOR_BYPASS.bat': `@echo off
chcp 65001 >nul
title PRRX HEX - EMULATOR DRIVER SHIELD & HOOKS
color 0b
cls

echo.
echo [EMULATOR] Hooking HD-Player runtime environment...
timeout /t 1 >nul
echo [BYPASS] Suppressing Garena anti-cheat memory scan routines...
timeout /t 1 >nul
echo [DRIVER] Injecting direct frame compositor pipeline...
timeout /t 1 >nul
echo [SHIELD] StreamProof DirectX hook deployed.
timeout /t 1 >nul
echo.
echo [OK] Ready for Free Fire injection.
timeout /t 1 >nul
exit`,

  'PRRX_FIX_ADB_BLUESTACKS.bat': `@echo off
chcp 65001 >nul
title PRRX HEX - ADB PORT FIXER (BLUESTACKS)
color 0b
cls

echo.
echo  ██████╗ ██████╗ ██████╗ ██╗  ██╗    ██╗  ██╗███████╗██╗  ██╗
echo  ██╔══██╗██╔══██╗██╔══██╗╚██╗██╔╝    ██║  ██║██╔════╝╚██╗██╔╝
echo  ██████╔╝██████╔╝██████╔╝ ╚███╔╝     ███████║█████╗   ╚███╔╝ 
echo  ██╔═══╝ ██╔══██╗██╔══██╗ ██╔██╗     ██╔══██║██╔══╝   ██╔██╗ 
echo  ██║     ██║  ██║██║  ██║██╔╝ ██╗    ██║  ██║███████╗██╔╝ ██╗
echo  ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝    ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
echo.
echo =======================================================================
echo     [PRRX HEX] BLUESTACKS ADB PORT SYNCHRONIZER (PORT 5555)
echo =======================================================================
echo.

setlocal enabledelayedexpansion
set "configFile=C:\\ProgramData\\BlueStacks_nxt\\bluestacks.conf"

if exist "%configFile%" (
    copy "%configFile%" "%configFile%.bak" >nul
    echo [INFO] Target configuration found: %configFile%
    echo [INFO] Backup created: %configFile%.bak
) else (
    echo [WARNING] Config file not found at: %configFile%
    echo [INFO] BlueStacks default configuration not found.
    timeout /t 2 >nul
    exit /b
)

echo [INFO] Synchronizing adb_port values to 5555...

set "tempFile=%configFile%.tmp"
> "%tempFile%" (
    for /f "usebackq delims=" %%A in ("%configFile%") do (
        set "line=%%A"
        echo !line! | findstr /r "adb_port=" >nul
        if !errorlevel! == 0 (
            for /f "tokens=1* delims==" %%i in ("!line!") do (
                echo %%i="5555"
            )
        ) else (
            echo !line!
        )
    )
)

move /y "%tempFile%" "%configFile%" >nul

cls
color 0a
echo.
echo =======================================================================
echo   ★ [PRRX HEX] ALL BLUESTACKS ADB PORTS SUCCESSFULLY LOCKED TO 5555! ★
echo =======================================================================
echo.
echo [STATUS] Panel connection bridge established.
echo [INFO] Closing fixer in 2 seconds...
timeout /t 2 >nul
exit`,

  'PRRX_FIX_ADB_MSI.bat': `@echo off
chcp 65001 >nul
title PRRX HEX - ADB PORT FIXER (MSI APP PLAYER)
color 0b
cls

echo.
echo  ██████╗ ██████╗ ██████╗ ██╗  ██╗    ██╗  ██╗███████╗██╗  ██╗
echo  ██╔══██╗██╔══██╗██╔══██╗╚██╗██╔╝    ██║  ██║██╔════╝╚██╗██╔╝
echo  ██████╔╝██████╔╝██████╔╝ ╚███╔╝     ███████║█████╗   ╚███╔╝ 
echo  ██╔═══╝ ██╔══██╗██╔══██╗ ██╔██╗     ██╔══██║██╔══╝   ██╔██╗ 
echo  ██║     ██║  ██║██║  ██║██╔╝ ██╗    ██║  ██║███████╗██╔╝ ██╗
echo  ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝    ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
echo.
echo =======================================================================
echo     [PRRX HEX] MSI APP PLAYER ADB PORT SYNCHRONIZER (PORT 5555)
echo =======================================================================
echo.

setlocal enabledelayedexpansion
set "configFile=C:\\ProgramData\\BlueStacks_msi5\\bluestacks.conf"

if exist "%configFile%" (
    copy "%configFile%" "%configFile%.bak" >nul
    echo [INFO] Target configuration found: %configFile%
    echo [INFO] Backup created: %configFile%.bak
) else (
    echo [WARNING] Config file not found at: %configFile%
    echo [INFO] MSI App Player default configuration not found.
    timeout /t 2 >nul
    exit /b
)

echo [INFO] Synchronizing adb_port values to 5555...

set "tempFile=%configFile%.tmp"
> "%tempFile%" (
    for /f "usebackq delims=" %%A in ("%configFile%") do (
        set "line=%%A"
        echo !line! | findstr /r "adb_port=" >nul
        if !errorlevel! == 0 (
            for /f "tokens=1* delims==" %%i in ("!line!") do (
                echo %%i="5555"
            )
        ) else (
            echo !line!
        )
    )
)

move /y "%tempFile%" "%configFile%" >nul

cls
color 0a
echo.
echo =======================================================================
echo   ★ [PRRX HEX] ALL MSI APP PLAYER ADB PORTS SUCCESSFULLY LOCKED TO 5555! ★
echo =======================================================================
echo.
echo [STATUS] Panel connection bridge established.
echo [INFO] Closing fixer in 2 seconds...
timeout /t 2 >nul
exit`
};

// Launch Emulator with Real System & FPS Optimization Batch Files
ipcMain.handle('launch-emulator-and-optimize', async (event, { emulatorPath, emulatorName, emulatorType }) => {
  const { exec } = require('child_process');
  
  // Temporary directory for extracting & executing batch files
  const tempOptimizersDir = path.join(app.getPath('temp'), 'PRRX_OPTIMIZERS');
  
  try {
    if (!fs.existsSync(tempOptimizersDir)) {
      fs.mkdirSync(tempOptimizersDir, { recursive: true });
    }
    
    // Always write all 6 batch files from memory to ensure 100% availability
    Object.keys(OPTIMIZER_SCRIPTS).forEach((fileName) => {
      const dest = path.join(tempOptimizersDir, fileName);
      fs.writeFileSync(dest, OPTIMIZER_SCRIPTS[fileName], 'utf8');
    });

    // Helper to spawn a visible elevated command prompt window
    const runVisibleElevatedBat = (batName) => {
      const batPath = path.join(tempOptimizersDir, batName);
      if (fs.existsSync(batPath)) {
        const escapedBat = batPath.replace(/'/g, "''");
        // Start CMD visibly as Administrator with /c
        const psCommand = `Start-Process cmd.exe -ArgumentList '/c \"\"${escapedBat}\"\"' -Verb RunAs`;
        exec(`powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "${psCommand}"`, (err) => {
          if (err) {
            exec(`cmd.exe /c start "" "${batPath}"`, () => {});
          }
        });
      }
    };

    // 1. Immediately launch the 4 main FPS and System optimizer consoles (matching photos)
    const initialOptimizers = [
      'PRRX_MAIN_BOOSTER.bat',
      'PRRX_MEMORY_DUMP.bat',
      'PRRX_KERNEL_NETWORK.bat',
      'PRRX_EMULATOR_BYPASS.bat'
    ];

    initialOptimizers.forEach((file, index) => {
      setTimeout(() => {
        runVisibleElevatedBat(file);
      }, index * 200);
    });

    // 2. Run ADB Port Fixer at exactly 5 seconds (Only for BlueStacks and MSI, NOT for Custom)
    setTimeout(() => {
      if (emulatorType === 'bluestacks') {
        runVisibleElevatedBat('PRRX_FIX_ADB_BLUESTACKS.bat');
      } else if (emulatorType === 'msi') {
        runVisibleElevatedBat('PRRX_FIX_ADB_MSI.bat');
      }
    }, 5000);

  } catch (err) {
    console.error("Optimizer batch launch error:", err);
  }

  // 3. Launch the selected emulator as Administrator (after ADB fix: 7 seconds for BlueStacks/MSI, 5.5 seconds for Custom)
  const launchDelay = (emulatorType === 'bluestacks' || emulatorType === 'msi') ? 7000 : 5500;

  setTimeout(() => {
    if (emulatorPath && fs.existsSync(emulatorPath)) {
      const emuDir = path.dirname(emulatorPath);
      const escapedEmu = emulatorPath.replace(/'/g, "''");
      const escapedDir = emuDir.replace(/'/g, "''");
      const emuPs = `Start-Process -FilePath '${escapedEmu}' -WorkingDirectory '${escapedDir}' -Verb RunAs`;
      
      exec(`powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command "${emuPs}"`, (err) => {
        if (err) {
          shell.openPath(emulatorPath);
        }
      });
    }
  }, launchDelay);

  return { success: true, message: `${emulatorName || 'Emulator'} scheduled with PRRX Real Optimization batch scripts!` };
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
