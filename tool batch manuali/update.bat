@echo off
cd /d %~dp0..

set LOGFILE=log_update.txt

echo =========================
echo AVVIO AGGIORNAMENTO
echo =========================

echo Avvio: %date% %time% > %LOGFILE%

echo.
echo [1/6] Sync CARDS...
call npm run sync:cards >> %LOGFILE% 2>&1
if %errorlevel% neq 0 goto errore

echo [2/6] Sync EVENT ASSETS...
call npm run sync:events:assets >> %LOGFILE% 2>&1
if %errorlevel% neq 0 goto errore

echo [3/6] Sync REWARDS...
call npm run sync:rewards >> %LOGFILE% 2>&1
if %errorlevel% neq 0 goto errore

echo [4/6] AUTO-FIX CONTENUTI...
call npm run autofix:content >> %LOGFILE% 2>&1
if %errorlevel% neq 0 goto errore

echo [5/6] AUDIT CONTENUTI...
call npm run audit:all >> %LOGFILE% 2>&1
if %errorlevel% neq 0 goto errore

echo [6/6] BUILD SITO...
call npm run build >> %LOGFILE% 2>&1
if %errorlevel% neq 0 goto errore

echo.
echo =========================
echo COMPLETATO
echo =========================

type %LOGFILE%
pause
exit /b

:errore
echo.
echo =========================
echo ERRORE DURANTE L'ESECUZIONE
echo =========================
echo Controlla il log: %LOGFILE%
echo.
type %LOGFILE%
pause
exit /b
