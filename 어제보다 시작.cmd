@echo off
title Better Than Yesterday
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%USERPROFILE%\Desktop\better-than-yesterday-start.ps1"
if errorlevel 1 pause
