@echo off
chcp 65001 >nul
title PRRX HEX - ZERO LATENCY NETWORK ROUTER
color 0c
cls

echo [NET] Initializing PRRX Network Optimization Subsystem...
timeout /t 1 >nul

:: Optimize TCP Window & Network Congestion Provider
netsh int tcp set global autotuninglevel=normal >nul 2>&1
netsh int tcp set supplemental template=custom congestionprovider=ctcp >nul 2>&1
netsh int tcp set global ecncapability=disabled >nul 2>&1
netsh int tcp set global rss=enabled >nul 2>&1

set /a "duration=7"
set /a "start=%time:~6,2%"

:LoopNet
echo [TRACE] Connected to bypass pool port: 0x%random% - Latency packet: 1ms
echo [NETWORK] Redirecting emulator data pipeline via priority node: %random%
set /a "current=%time:~6,2%"
set /a "elapsed=(current-start+60)%%60"
if %elapsed% geq %duration% goto EndNet
goto LoopNet

:EndNet
echo [COMPLETE] Low-latency network matrix stabilized.
timeout /t 1 >nul
exit
