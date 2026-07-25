@echo off
chcp 65001 >nul
title Betterthan Release Builder
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "C:\Users\ttn20\Desktop\바이브코딩\toss mini app\better than yesterday\scripts\make-release.ps1"
echo.
if errorlevel 1 (
  echo Release build failed. Check the error above.
) else (
  echo Release build completed.
)
pause
