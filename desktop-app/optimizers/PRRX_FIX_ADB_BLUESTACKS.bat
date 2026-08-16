@echo off
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
set "configFile=C:\ProgramData\BlueStacks_nxt\bluestacks.conf"

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
exit
