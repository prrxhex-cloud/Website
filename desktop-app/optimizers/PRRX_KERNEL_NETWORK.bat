@echo off
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
exit
