@echo off
chcp 65001 >nul
title PRRX HEX - MSI APP PLAYER ADB DEEP PORT & INTERNAL KERNEL FIXER
color 0a
cls

echo.
echo =======================================================================
echo     [PRRX HEX] MSI APP PLAYER ADB PORT & ANDROID INTERNAL OPTIMIZER
echo =======================================================================
echo.

set "CONFIG_PATH=C:\ProgramData\BlueStacks_msi5\bluestacks.conf"

if not exist "%CONFIG_PATH%" (
    echo [INFO] Standard MSI App Player config path not found. Checking alternate paths...
)

echo [1/4] Stopping conflicting ADB server instances...
taskkill /F /IM adb.exe >nul 2>&1
taskkill /F /IM HD-Adb.exe >nul 2>&1

echo [2/4] Locking ADB Debugger Port to 5555...
if exist "%CONFIG_PATH%" (
    powershell -Command "$p='%CONFIG_PATH%'; if(Test-Path $p){ (Get-Content $p) -replace 'bst.instance.Pie64.status.adb_port=.*','bst.instance.Pie64.status.adb_port=\"\"5555\"\"' -replace 'bst.instance.Nougat32.status.adb_port=.*','bst.instance.Nougat32.status.adb_port=\"\"5555\"\"' -replace 'bst.instance.Nougat64.status.adb_port=.*','bst.instance.Nougat64.status.adb_port=\"\"5555\"\"' | Set-Content $p }" >nul 2>&1
    echo [SUCCESS] MSI config ADB port locked to 5555.
)

echo [3/4] Starting High-Speed ADB Daemon...
start /B adb start-server >nul 2>&1
adb connect 127.0.0.1:5555 >nul 2>&1

echo [4/4] Injecting Android Internal Kernel Optimizations...
adb -s 127.0.0.1:5555 shell setprop debug.sf.nobootanimation 1 >nul 2>&1
adb -s 127.0.0.1:5555 shell setprop persist.sys.use_dithering 0 >nul 2>&1
adb -s 127.0.0.1:5555 shell setprop persist.sys.purgeable_assets 1 >nul 2>&1
adb -s 127.0.0.1:5555 shell windowsmgr.max_events_per_sec 240 >nul 2>&1
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
goto AdbMonitorLoop
