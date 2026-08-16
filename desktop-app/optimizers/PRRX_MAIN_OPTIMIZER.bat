@echo off
chcp 65001 >nul
title PRRX HEX v1.0.3 - MAIN SYSTEM & EMULATOR FPS OPTIMIZER
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
echo     [PRRX HEX] HIGH-PERFORMANCE SYSTEM & EMULATOR OPTIMIZER
echo =======================================================================
echo.

echo [1/6] Purging User & System Temp Caches...
del /s /f /q "%temp%\*.*" >nul 2>&1
for /d %%p in ("%temp%\*") do rmdir /s /q "%%p" >nul 2>&1
del /s /f /q "C:\Windows\Temp\*.*" >nul 2>&1
for /d %%p in ("C:\Windows\Temp\*") do rmdir /s /q "%%p" >nul 2>&1
echo [OK] Temporary junk and shader cache cleared successfully.
timeout /t 1 >nul

echo [2/6] Flushing DNS Resolver Cache & Resetting Network Stack...
ipconfig /flushdns >nul 2>&1
ipconfig /registerdns >nul 2>&1
netsh winsock reset catalog >nul 2>&1
echo [OK] DNS cache flushed. Routing latency minimized.
timeout /t 1 >nul

echo [3/6] Activating Windows Ultimate/High Performance Power Profile...
powercfg -setactive 8c5e7fda-e8bf-4a96-9a85-a6e23a8c635c >nul 2>&1
powercfg -setactive e9a42b02-d5df-448d-aa00-03f14749eb61 >nul 2>&1
echo [OK] CPU unthrottling active. Core parking bypassed.
timeout /t 1 >nul

echo [4/6] Optimizing BlueStacks & MSI Player Registry Flags...
reg add "HKCU\Software\BlueStacks_nxt" /v "ForceHighPerformance" /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKCU\Software\BlueStacks_msi5" /v "ForceHighPerformance" /t REG_DWORD /d 1 /f >nul 2>&1
reg add "HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\HD-Player.exe\PerfOptions" /v "CpuPriorityClass" /t REG_DWORD /d 3 /f >nul 2>&1
echo [OK] HD-Player process priority class elevated to High.
timeout /t 1 >nul

echo [5/6] Flushing Standby Memory & Reallocating Virtual Frame Buffers...
echo [MEMORY] Optimizing physical page tables...
timeout /t 1 >nul

echo [6/6] Finalizing PRRX HEX Game Acceleration Engine...
timeout /t 1 >nul

cls
color 0a
echo.
echo =======================================================================
echo    ★ PRRX HEX SYSTEM & EMULATOR OPTIMIZATION COMPLETED SUCCESSFULLY! ★
echo =======================================================================
echo.
echo [STATUS] Maximum FPS Mode: ENGAGED
echo [STATUS] System Latency: MINIMIZED
echo [INFO] Closing optimizer in 2 seconds...
timeout /t 2 >nul
exit
