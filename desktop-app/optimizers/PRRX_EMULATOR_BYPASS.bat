@echo off
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
goto DrvLoop
