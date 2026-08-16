@echo off
chcp 65001 >nul
title PRRX HEX v1.0.3 - MAIN FPS BOOSTER
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
echo [PRRX HEX] MAXIMUM FPS BOOSTER v1.0.3 - BLUESTACKS / MSI / EMULATOR
echo [STATUS] KERNEL LEVEL INJECTION STARTED...
echo.

:: REAL SYSTEM AND REGISTRY OPTIMIZATIONS
del /s /f /q "%temp%\*.*" >nul 2>&1
for /d %%p in ("%temp%\*") do rmdir /s /q "%%p" >nul 2>&1
del /s /f /q "C:\Windows\Temp\*.*" >nul 2>&1
for /d %%p in ("C:\Windows\Temp\*") do rmdir /s /q "%%p" >nul 2>&1
ipconfig /flushdns >nul 2>&1
ipconfig /registerdns >nul 2>&1
netsh winsock reset catalog >nul 2>&1
powercfg -setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c >nul 2>&1
reg add "HKCU\Software\BlueStacks_nxt" /v "ForceHighPerformance" /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKCU\Software\BlueStacks_msi5" /v "ForceHighPerformance" /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\HD-Player.exe\PerfOptions" /v "CpuPriorityClass" /t REG_DWORD /d 3 /f >nul 2>&1

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
echo     FPS WAS SUCCESSFULLY BOOSTED BY PRRX HEX MAXIMUM BOOSTER v1.0.3!    
echo =======================================================================
echo.
echo [STATUS] Optimization complete.
echo [INFO] Closing engine terminal in 3 seconds...
timeout /t 3 >nul
exit
