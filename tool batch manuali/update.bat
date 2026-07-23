@echo off
setlocal EnableDelayedExpansion
cd /d %~dp0..

set "LOGFILE=log_update.txt"
set "HAD_ERROR=0"
set "PUSH_CHOICE="
set "REBASE_CHOICE="
set "BRANCH_NAME="

echo =========================
echo AVVIO AGGIORNAMENTO
echo =========================

echo Avvio: %date% %time% > "%LOGFILE%"

call :runStep "[1/6] Sync CARDS..." "npm run sync:cards"
call :runStep "[2/6] Sync EVENT ASSETS..." "npm run sync:events:assets"
call :runStep "[3/6] Sync REWARDS..." "npm run sync:rewards"
call :runStep "[4/6] AUTO-FIX CONTENUTI..." "npm run autofix:content"
call :runStep "[5/6] AUDIT CONTENUTI..." "npm run audit:all"
call :runStep "[6/6] BUILD SITO..." "npm run build"

echo.
echo =========================
if "!HAD_ERROR!"=="0" (
  echo COMPLETATO SENZA ERRORI
) else (
  echo COMPLETATO CON ERRORI O PROBLEMI
)
echo =========================
echo.
type "%LOGFILE%"
echo.

:askPush
if "!HAD_ERROR!"=="0" (
  set /p "PUSH_CHOICE=Vuoi pushare? (S/N): "
) else (
  set /p "PUSH_CHOICE=Ci sono stati errori o problemi. Vuoi pushare comunque? (S/N): "
)

if /I "!PUSH_CHOICE!"=="S" goto doPush
if /I "!PUSH_CHOICE!"=="N" goto end

echo Scelta non valida. Inserisci S oppure N.
goto askPush

:doPush
echo.
echo =========================
echo AVVIO PUSH
echo =========================
echo.>> "%LOGFILE%"
echo =========================>> "%LOGFILE%"
echo AVVIO PUSH>> "%LOGFILE%"
echo =========================>> "%LOGFILE%"

git status --porcelain > "%TEMP%\pocket_hub_git_status.txt"
for %%A in ("%TEMP%\pocket_hub_git_status.txt") do set "GIT_STATUS_SIZE=%%~zA"
for /f "delims=" %%A in ('git branch --show-current') do set "BRANCH_NAME=%%A"

if not "!GIT_STATUS_SIZE!"=="0" (
  git add -A >> "%LOGFILE%" 2>&1
  git commit -m "chore: update content %date% %time%" >> "%LOGFILE%" 2>&1
  if errorlevel 1 (
    echo Commit non riuscito. Controlla il log: %LOGFILE%
    type "%LOGFILE%"
    pause
    exit /b 1
  )
) else (
  echo Nessuna modifica locale da committare.>> "%LOGFILE%"
)

git push origin HEAD >> "%LOGFILE%" 2>&1
if not errorlevel 1 goto pushOk

echo.
echo Push non riuscito al primo tentativo.
echo Se il repository remoto e' piu' avanti, posso provare un pull --rebase e ritentare il push.

:askRebase
set /p "REBASE_CHOICE=Vuoi eseguire il sync con il remoto e ritentare il push? (S/N): "
if /I "!REBASE_CHOICE!"=="S" goto doRebase
if /I "!REBASE_CHOICE!"=="N" goto pushFailed
echo Scelta non valida. Inserisci S oppure N.
goto askRebase

:doRebase
if "!BRANCH_NAME!"=="" set "BRANCH_NAME=main"
echo Eseguo pull --rebase da origin/!BRANCH_NAME!...>> "%LOGFILE%"
git pull --rebase origin !BRANCH_NAME! >> "%LOGFILE%" 2>&1
if errorlevel 1 (
  echo Il pull --rebase non e' andato a buon fine.
  echo Potrebbero esserci conflitti da risolvere manualmente.
  goto pushFailed
)

git push origin HEAD >> "%LOGFILE%" 2>&1
if errorlevel 1 goto pushFailed

:pushOk
echo Push completato con successo.
echo.
type "%LOGFILE%"
pause
exit /b 0

:pushFailed
echo Push non riuscito. Controlla il log: %LOGFILE%
echo.
type "%LOGFILE%"
pause
exit /b 1

:runStep
set "STEP_LABEL=%~1"
set "STEP_COMMAND=%~2"
echo.
echo %~1
echo %~1>> "%LOGFILE%"
call %~2 >> "%LOGFILE%" 2>&1
if errorlevel 1 (
  set "HAD_ERROR=1"
  echo ERRORE in %~1>> "%LOGFILE%"
)
exit /b 0

:end
pause
exit /b 0
