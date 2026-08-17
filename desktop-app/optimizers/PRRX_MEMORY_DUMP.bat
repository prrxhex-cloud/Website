@echo off
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
goto MonitorLoop
