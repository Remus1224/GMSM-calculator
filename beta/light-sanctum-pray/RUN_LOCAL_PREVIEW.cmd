@echo off
setlocal
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0RUN_LOCAL_PREVIEW.ps1"
if errorlevel 1 pause
