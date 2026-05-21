@echo off
cd /d %~dp0..

set LOGFILE=log_audit.txt

echo =========================
echo AVVIO CHECK CONTENUTI
echo =========================

echo Avvio: %date% %time% > %LOGFILE%

call npm run audit:all >> %LOGFILE% 2>&1

echo. >> %LOGFILE%
echo Fine: %date% %time% >> %LOGFILE%

if %errorlevel% neq 0 (
  echo.
  echo ❌ PROBLEMI RILEVATI DURANTE I CONTROLLI
  echo Controlla il file %LOGFILE%
  echo.
  type %LOGFILE%
  pause
  exit /b
)

echo.
echo =========================
echo ✅ NESSUN PROBLEMA RILEVATO
echo =========================
echo.

type %LOGFILE%

pause