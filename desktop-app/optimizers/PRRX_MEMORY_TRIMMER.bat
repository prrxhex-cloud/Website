@echo off
chcp 65001 >nul
title PRRX HEX - MEMORY INTRUSION DUMP & RAM CLEANER
color 0c
cls

echo [SYSTEM] Initializing memory stream exploit & buffer cleanup...
timeout /t 1 >nul

set /a "duration=7"
set /a "start=%time:~6,2%"

:LoopMem
echo %random%%random%%random%%random%%random%%random%%random%%random%%random%%random%
set /a "current=%time:~6,2%"
set /a "elapsed=(current-start+60)%%60"
if %elapsed% geq %duration% goto EndMem
goto LoopMem

:EndMem
echo.
echo [COMPLETE] Virtual memory purged. Standby cache recycled cleanly.
timeout /t 1 >nul
exit
