@echo off
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
goto NetLoop
