@echo off
setlocal EnableExtensions EnableDelayedExpansion

cd /d "%~dp0"..

set "PORT=4173"
set "HOST=127.0.0.1"
set "URL=http://%HOST%:%PORT%"
set "BUILD_LOG=%CD%\avvio-manuale-build.log"

echo.
echo ============================================
echo   Pocket Hub - Avvio manuale locale
echo ============================================
echo.

set "SITE_READY="
powershell -NoProfile -Command "try { $response = Invoke-WebRequest -UseBasicParsing '%URL%' -TimeoutSec 2; if ($response.StatusCode -ge 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
if not errorlevel 1 (
  set "SITE_READY=1"
)

if defined SITE_READY (
  echo Il sito e gia raggiungibile su %URL%
  cmd /c start "" "%URL%" >nul 2>nul
  exit /b 0
)

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js non e installato o non e disponibile nel PATH.
  echo Installa Node.js e riprova.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo npm non e disponibile nel PATH.
  echo Installa Node.js correttamente e riprova.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Dipendenze non trovate. Installazione in corso...
  powershell -NoProfile -ExecutionPolicy Bypass -Command "npm.cmd install"
  if errorlevel 1 (
    echo.
    echo Installazione dipendenze fallita.
    pause
    exit /b 1
  )
)

echo Build del progetto in corso...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$buildOutput = & npm.cmd run build *>&1; $exitCode = $LASTEXITCODE; $buildOutput | Out-File -FilePath '%BUILD_LOG%' -Encoding utf8; exit $exitCode"
if errorlevel 1 (
  if exist "dist\index.html" (
    echo.
    echo La build non e andata a buon fine, ma esiste gia una versione locale compilata.
    echo Continuo usando l ultima build disponibile in dist.
    echo Dettagli tecnici salvati in:
    echo %BUILD_LOG%
  ) else (
    echo.
    echo La build e fallita e non esiste una build locale da usare come fallback.
echo Dettagli tecnici salvati in:
    echo %BUILD_LOG%
    pause
    exit /b 1
  )
)

set "EXISTING_PID="
for /f %%P in ('powershell -NoProfile -Command "$portProcessId = Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1 -ExpandProperty OwningProcess; if ($portProcessId) { $portProcessId }"') do (
  set "EXISTING_PID=%%P"
)

if defined EXISTING_PID (
  echo Porta %PORT% occupata dal processo !EXISTING_PID!. Riavvio il server locale...
  taskkill /PID !EXISTING_PID! /F >nul 2>nul
  timeout /t 1 /nobreak >nul
)

echo Avvio del server di anteprima su %URL% ...
start "" /b cmd /c "node scripts\preview-server.mjs > preview.log 2> preview.err"

set "SERVER_READY="
for /l %%I in (1,1,20) do (
  powershell -NoProfile -Command "try { $response = Invoke-WebRequest -UseBasicParsing '%URL%' -TimeoutSec 2; if ($response.StatusCode -ge 200) { exit 0 } else { exit 1 } } catch { exit 1 }"
  if not errorlevel 1 (
    set "SERVER_READY=1"
    goto :server_ready
  )
  timeout /t 1 /nobreak >nul
)

:server_ready
if not defined SERVER_READY (
  echo.
  echo Il server non e partito correttamente.
  echo Controlla questi file per capire il problema:
  echo - "%CD%\preview.log"
  echo - "%CD%\preview.err"
  pause
  exit /b 1
)

echo.
echo Sito raggiungibile su %URL%
cmd /c start "" "%URL%" >nul 2>nul
exit /b 0
