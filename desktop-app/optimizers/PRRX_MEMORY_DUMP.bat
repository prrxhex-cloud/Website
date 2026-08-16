@echo off
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
exit
