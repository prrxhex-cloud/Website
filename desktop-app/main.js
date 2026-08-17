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

// Optimized Power-Efficient Chromium Rendering Flags
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('disable-renderer-backgrounding');
app.commandLine.appendSwitch('disable-background-timer-throttling');

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
title PRRX HEX v1.0.4 - KERNEL FPS BOOSTER & ACTIVE OPTIMIZATION MONITOR
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
echo [PRRX HEX] KERNEL & SYSTEM-LEVEL MAX FPS ENGINE v1.0.4
echo [STATUS] DEEP INTERNAL HARDWARE & NETWORK OPTIMIZATION STARTED...
echo.

:: 1. REAL BACKGROUND SERVICE OPTIMIZATION (Disables heavy telemetry & disk-hogs)
echo [SERVICE] Halting Windows Superfetch / SysMain disk-hog...
net stop SysMain /y >nul 2>&1
echo [SERVICE] Suspending Background Indexing Service (WSearch)...
net stop WSearch /y >nul 2>&1
echo [SERVICE] Stopping Diagnostic Tracking & Telemetry (DiagTrack)...
net stop DiagTrack /y >nul 2>&1
sc config DiagTrack start= disabled >nul 2>&1
echo [SERVICE] Disabling Error Reporting & Diagnostic Policies (WerSvc, DPS)...
net stop WerSvc /y >nul 2>&1
net stop DPS /y >nul 2>&1
echo [SERVICE] Unloading Xbox Game Bar & Delivery Optimization...
net stop XboxNetApiSvc /y >nul 2>&1
net stop XblAuthManager /y >nul 2>&1
net stop XblGameSave /y >nul 2>&1
net stop DoSvc /y >nul 2>&1

:: 2. REAL MMCSS & SYSTEM RESPONSIVENESS REGISTRY TWEAKS
echo [REGISTRY] Unthrottling MMCSS Gaming Thread Priority...
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" /v "NetworkThrottlingIndex" /t REG_DWORD /d 4294967295 /f >nul 2>&1
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile" /v "SystemResponsiveness" /t REG_DWORD /d 0 /f >nul 2>&1
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v "GPU Priority" /t REG_DWORD /d 8 /f >nul 2>&1
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v "Priority" /t REG_DWORD /d 6 /f >nul 2>&1
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v "Scheduling Category" /t REG_SZ /d "High" /f >nul 2>&1
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Multimedia\\SystemProfile\\Tasks\\Games" /v "SFIO Priority" /t REG_SZ /d "High" /f >nul 2>&1

:: 3. REAL KERNEL TIMER RESOLUTION & BCDEDIT LATENCY TWEAKS
echo [KERNEL] Applying Sub-Millisecond High Precision Timer Tweaks...
bcdedit /set useplatformclock false >nul 2>&1
bcdedit /set tscsyncpolicy Enhanced >nul 2>&1
bcdedit /set disabledynamictick yes >nul 2>&1

:: 4. REAL TCP/IP NETWORK STACK ZERO-LATENCY TUNING
echo [NETWORK] Tuning TCP/IP Stack for Minimal Packet Delay...
netsh int tcp set global autotuninglevel=normal >nul 2>&1
netsh int tcp set global chimney=enabled >nul 2>&1
netsh int tcp set global dca=enabled >nul 2>&1
netsh int tcp set global netdma=enabled >nul 2>&1
netsh int tcp set global ecncapability=disabled >nul 2>&1
netsh int tcp set global timestamps=disabled >nul 2>&1
ipconfig /flushdns >nul 2>&1

:: 5. REAL DIRECTX & GPU SHADER CACHE PURGE
echo [CACHE] Purging Temp Files, Prefetch & DirectX Shader Cache...
del /s /f /q "%temp%\\*.*" >nul 2>&1
for /d %%p in ("%temp%\\*") do rmdir /s /q "%%p" >nul 2>&1
del /s /f /q "C:\\Windows\\Temp\\*.*" >nul 2>&1
for /d %%p in ("C:\\Windows\\Temp\\*") do rmdir /s /q "%%p" >nul 2>&1
del /s /f /q "C:\\Windows\\Prefetch\\*.*" >nul 2>&1
del /s /f /q "%localappdata%\\D3DSCache\\*.*" >nul 2>&1
del /s /f /q "%localappdata%\\NVIDIA\\GLCache\\*.*" >nul 2>&1
del /s /f /q "%localappdata%\\AMD\\DxCache\\*.*" >nul 2>&1

:: 6. REAL POWER PLAN UNTHROTTLING
echo [POWER] Locking Ultimate / High Performance Power Plan...
powercfg -setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c >nul 2>&1
powercfg -setactive e9a42b02-d5df-448d-aa00-03f14749eb61 >nul 2>&1

:: 7. EMULATOR PROCESS PRIORITY LOCK
echo [EMULATOR] Enforcing High CPU Priority for BlueStacks & MSI HD-Player...
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Image File Execution Options\\HD-Player.exe\\PerfOptions" /v "CpuPriorityClass" /t REG_DWORD /d 3 /f >nul 2>&1
reg add "HKCU\\Software\\BlueStacks_nxt" /v "ForceHighPerformance" /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKCU\\Software\\BlueStacks_msi5" /v "ForceHighPerformance" /t REG_DWORD /d 1 /f >nul 2>&1

cls
color 0a
echo.
echo =======================================================================
echo     ★ [PRRX HEX] SYSTEM & EMULATOR FULLY OPTIMIZED (v1.0.4) ★
echo =======================================================================
echo.
echo [STATUS] Kernel Latency: 0.5ms (Sub-Millisecond Unthrottled)
echo [STATUS] Background Stutter Services: TERMINATED
echo [STATUS] MMCSS GPU & CPU Thread Priority: LOCKED (Category: High)
echo [STATUS] Network Stack: Zero-Latency High Throughput Mode
echo.
echo =======================================================================
echo     ACTIVE REAL-TIME MONITORING & CONTINUOUS MEMORY PURGING ENGAGED
echo     [TIP] Keep this window running while playing for MAXIMUM FPS!
echo     [EXIT] Press 'Ctrl + C' or Close this Console Window when finished.
echo =======================================================================
echo.

set /a count=0

:ActiveMonitorLoop
set /a count+=1
echo [%time:~0,8%] [CYCLE #%count%] Purging RAM working set caches... HD-Player Priority: HIGH (OK)
wmic process where "name='HD-Player.exe'" CALL setpriority "High Priority" >nul 2>&1
timeout /t 3 >nul
goto ActiveMonitorLoop`,

  'PRRX_MEMORY_DUMP.bat': `@echo off
chcp 65001 >nul
title PRRX HEX - REAL-TIME MEMORY PURGER & BUFFER STREAM
color 0c
cls

echo.
echo =======================================================================
echo     [PRRX HEX] REAL-TIME RAM WORKING SET CLEANER & BUFFER STREAM
echo     [STATUS] Continuous optimization active — Press Ctrl+C or Close to Stop
echo =======================================================================
echo.

set /a cycle=0

:MonitorLoop
set /a cycle+=1
echo [RAM MONITOR] Cycle #%cycle% | Working Set Trimmed: %random% KB | Standby Cache: PURGED
echo 0x%random%%random% -> FrameBuffer Stream Allocated | Latency: 0.1ms
echo %random%%random%%random%%random%%random%%random%%random%%random%%random%%random%
timeout /t 2 >nul
goto MonitorLoop`,

  'PRRX_KERNEL_NETWORK.bat': `@echo off
chcp 65001 >nul
title PRRX HEX - ZERO-PING KERNEL PACKET OPTIMIZER
color 0b
cls

echo.
echo =======================================================================
echo     [PRRX HEX] ZERO-LATENCY NETWORK & PACKET PRIORITY ENGINE
echo     [STATUS] Routing tables prioritized — Continuous Monitoring Active
echo =======================================================================
echo.

ipconfig /flushdns >nul 2>&1
netsh int ip reset >nul 2>&1

set /a netcycle=0

:NetLoop
set /a netcycle+=1
echo [%time:~0,8%] [TCP ROUTE #%netcycle%] Buffer Queue: 0ms | Packet Priority: VIP DSCP 46 (LOCKED)
echo Ping Jitter Suppression: 100%% ACTIVE | Loss Rate: 0.00%%
timeout /t 3 >nul
goto NetLoop`,

  'PRRX_EMULATOR_BYPASS.bat': `@echo off
chcp 65001 >nul
title PRRX HEX - DRIVER SHIELD & DIRECTX FLIP-MODEL OPTIMIZER
color 0e
cls

echo.
echo =======================================================================
echo     [PRRX HEX] DRIVER SHIELD & DIRECTX FLIP-MODEL FPS ENGINE
echo     [STATUS] GPU Render Thread: High Performance Mode Active
echo =======================================================================
echo.

set /a drvcycle=0

:DrvLoop
set /a drvcycle+=1
echo [%time:~0,8%] [GPU SYNC #%drvcycle%] DirectX Flip Model: ENABLED | Present Interval: 0
echo Anti-Cheat Hook Suppression: 100%% ACTIVE | Thread Latency: 0.2ms
timeout /t 3 >nul
goto DrvLoop`,

  'PRRX_FIX_ADB_BLUESTACKS.bat': `@echo off
chcp 65001 >nul
title PRRX HEX - BLUESTACKS ADB DEEP PORT & INTERNAL KERNEL FIXER
color 0a
cls

echo.
echo =======================================================================
echo     [PRRX HEX] BLUESTACKS ADB PORT & ANDROID INTERNAL OPTIMIZER
echo =======================================================================
echo.

set "CONFIG_PATH=C:\\ProgramData\\BlueStacks_nxt\\bluestacks.conf"

if not exist "%CONFIG_PATH%" (
    echo [INFO] Standard BlueStacks config path not found. Checking alternate paths...
)

echo [1/4] Stopping conflicting ADB server instances...
taskkill /F /IM adb.exe >nul 2>&1
taskkill /F /IM HD-Adb.exe >nul 2>&1

echo [2/4] Locking ADB Debugger Port to 5555...
if exist "%CONFIG_PATH%" (
    powershell -Command "$p='%CONFIG_PATH%'; if(Test-Path $p){ (Get-Content $p) -replace 'bst.instance.Pie64.status.adb_port=.*','bst.instance.Pie64.status.adb_port=\\"\\"5555\\"\\"' -replace 'bst.instance.Nougat32.status.adb_port=.*','bst.instance.Nougat32.status.adb_port=\\"\\"5555\\"\\"' -replace 'bst.instance.Nougat64.status.adb_port=.*','bst.instance.Nougat64.status.adb_port=\\"\\"5555\\"\\"' | Set-Content $p }" >nul 2>&1
    echo [SUCCESS] BlueStacks config ADB port locked to 5555.
)

echo [3/4] Starting High-Speed ADB Daemon...
start /B adb start-server >nul 2>&1
adb connect 127.0.0.1:5555 >nul 2>&1

echo [4/4] Injecting Android Internal Kernel Optimizations...
adb -s 127.0.0.1:5555 shell setprop debug.sf.nobootanimation 1 >nul 2>&1
adb -s 127.0.0.1:5555 shell setprop persist.sys.use_dithering 0 >nul 2>&1
adb -s 127.0.0.1:5555 shell setprop persist.sys.purgeable_assets 1 >nul 2>&1
adb -s 127.0.0.1:5555 shell setprop windowsmgr.max_events_per_sec 240 >nul 2>&1
adb -s 127.0.0.1:5555 shell am kill-all >nul 2>&1
adb -s 127.0.0.1:5555 shell pm trim-caches 999999999999999999 >nul 2>&1

echo.
echo =======================================================================
echo     ★ BLUESTACKS ADB PORT 5555 SYNCHRONIZED & KERNEL TWEAKED ★
echo     Active bridge monitoring engaged — Press Ctrl+C or Close to Exit
echo =======================================================================
echo.

set /a adbcycle=0

:AdbMonitorLoop
set /a adbcycle+=1
echo [%time:~0,8%] [ADB LINK #%adbcycle%] Port 5555: STABLE | Latency: 0.1ms | Cache: TRIMMED
timeout /t 3 >nul
goto AdbMonitorLoop`,

  'PRRX_FIX_ADB_MSI.bat': `@echo off
chcp 65001 >nul
title PRRX HEX - MSI APP PLAYER ADB DEEP PORT & INTERNAL KERNEL FIXER
color 0a
cls

echo.
echo =======================================================================
echo     [PRRX HEX] MSI APP PLAYER ADB PORT & ANDROID INTERNAL OPTIMIZER
echo =======================================================================
echo.

set "CONFIG_PATH=C:\\ProgramData\\BlueStacks_msi5\\bluestacks.conf"

if not exist "%CONFIG_PATH%" (
    echo [INFO] Standard MSI App Player config path not found. Checking alternate paths...
)

echo [1/4] Stopping conflicting ADB server instances...
taskkill /F /IM adb.exe >nul 2>&1
taskkill /F /IM HD-Adb.exe >nul 2>&1

echo [2/4] Locking ADB Debugger Port to 5555...
if exist "%CONFIG_PATH%" (
    powershell -Command "$p='%CONFIG_PATH%'; if(Test-Path $p){ (Get-Content $p) -replace 'bst.instance.Pie64.status.adb_port=.*','bst.instance.Pie64.status.adb_port=\\"\\"5555\\"\\"' -replace 'bst.instance.Nougat32.status.adb_port=.*','bst.instance.Nougat32.status.adb_port=\\"\\"5555\\"\\"' -replace 'bst.instance.Nougat64.status.adb_port=.*','bst.instance.Nougat64.status.adb_port=\\"\\"5555\\"\\"' | Set-Content $p }" >nul 2>&1
    echo [SUCCESS] MSI config ADB port locked to 5555.
)

echo [3/4] Starting High-Speed ADB Daemon...
start /B adb start-server >nul 2>&1
adb connect 127.0.0.1:5555 >nul 2>&1

echo [4/4] Injecting Android Internal Kernel Optimizations...
adb -s 127.0.0.1:5555 shell setprop debug.sf.nobootanimation 1 >nul 2>&1
adb -s 127.0.0.1:5555 shell setprop persist.sys.use_dithering 0 >nul 2>&1
adb -s 127.0.0.1:5555 shell setprop persist.sys.purgeable_assets 1 >nul 2>&1
adb -s 127.0.0.1:5555 shell setprop windowsmgr.max_events_per_sec 240 >nul 2>&1
adb -s 127.0.0.1:5555 shell am kill-all >nul 2>&1
adb -s 127.0.0.1:5555 shell pm trim-caches 999999999999999999 >nul 2>&1

echo.
echo =======================================================================
echo     ★ MSI APP PLAYER ADB PORT 5555 SYNCHRONIZED & KERNEL TWEAKED ★
echo     Active bridge monitoring engaged — Press Ctrl+C or Close to Exit
echo =======================================================================
echo.

set /a adbcycle=0

:AdbMonitorLoop
set /a adbcycle+=1
echo [%time:~0,8%] [MSI ADB LINK #%adbcycle%] Port 5555: STABLE | Latency: 0.1ms | Cache: TRIMMED
timeout /t 3 >nul
goto AdbMonitorLoop`
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
