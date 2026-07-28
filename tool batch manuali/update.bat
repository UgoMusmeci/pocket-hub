@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul
cd /d %~dp0..

set "NO_COLOR=1"
set "FORCE_COLOR=0"
set "CI=1"
set "TERM=dumb"
set "LOGFILE=log_update.full.txt"
set "SUMMARYFILE=log_update.summary.txt"
set "STEPLOG=%TEMP%\pocket_hub_update_step.log"
set "HAD_ERROR=0"
set "PUSH_CHOICE="
set "REBASE_CHOICE="
set "BRANCH_NAME="
set "RETRY_WAIT_SECONDS=3"

echo =========================
echo AVVIO AGGIORNAMENTO
echo =========================

> "%LOGFILE%" echo Avvio: %date% %time%
> "%SUMMARYFILE%" echo RIEPILOGO AGGIORNAMENTO - %date% %time%
>> "%SUMMARYFILE%" echo.

call :runStep "[1/7] Sync CARDS..." "npm run sync:cards"
call :runStep "[2/7] Verifica ESPANSIONI..." "node scripts/report-content-health.mjs"
call :runStep "[3/7] Sync EVENT ASSETS..." "npm run sync:events:assets"
call :runStep "[4/7] Sync REWARDS..." "npm run sync:rewards"
call :runStep "[5/7] AUTO-FIX CONTENUTI..." "npm run autofix:content"
call :runStep "[6/7] AUDIT CONTENUTI..." "npm run audit:all"
call :runStep "[7/7] BUILD SITO..." "npm run build"

echo.
echo =========================
if "!HAD_ERROR!"=="0" (
  echo COMPLETATO SENZA ERRORI
  >> "%SUMMARYFILE%" echo Esito finale: COMPLETATO SENZA ERRORI
) else (
  echo COMPLETATO CON ERRORI O PROBLEMI
  >> "%SUMMARYFILE%" echo Esito finale: COMPLETATO CON ERRORI O PROBLEMI
)
echo =========================
echo.

type "%SUMMARYFILE%"
echo.
echo Log completo: %LOGFILE%
echo Riepilogo: %SUMMARYFILE%
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
>> "%LOGFILE%" echo.
>> "%LOGFILE%" echo =========================
>> "%LOGFILE%" echo AVVIO PUSH
>> "%LOGFILE%" echo =========================
>> "%SUMMARYFILE%" echo.
>> "%SUMMARYFILE%" echo PUSH

git status --porcelain > "%TEMP%\pocket_hub_git_status.txt"
for %%A in ("%TEMP%\pocket_hub_git_status.txt") do set "GIT_STATUS_SIZE=%%~zA"
for /f "delims=" %%A in ('git branch --show-current') do set "BRANCH_NAME=%%A"
if "!BRANCH_NAME!"=="" set "BRANCH_NAME=main"

if not "!GIT_STATUS_SIZE!"=="0" (
  call :runCommand "Commit locale" "git add -A && git commit -m ""chore: update content %date% %time%"""
  if errorlevel 1 goto pushFailed
) else (
  >> "%SUMMARYFILE%" echo - Nessuna modifica locale da committare.
)

call :runCommand "Push su origin/!BRANCH_NAME!" "git push origin HEAD:!BRANCH_NAME!"
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
call :runCommand "Pull --rebase da origin/!BRANCH_NAME!" "git pull --rebase origin !BRANCH_NAME!"
if errorlevel 1 (
  echo Il pull --rebase non e' andato a buon fine.
  echo Potrebbero esserci conflitti da risolvere manualmente.
  goto pushFailed
)

call :runCommand "Secondo tentativo di push" "git push origin HEAD:!BRANCH_NAME!"
if errorlevel 1 goto pushFailed

:pushOk
echo Push completato con successo.
echo.
type "%SUMMARYFILE%"
echo.
echo Log completo: %LOGFILE%
pause
exit /b 0

:pushFailed
echo Push non riuscito. Controlla il riepilogo e, se serve, il log completo.
echo.
type "%SUMMARYFILE%"
echo.
echo Log completo: %LOGFILE%
pause
exit /b 1

:runStep
set "STEP_LABEL=%~1"
set "STEP_COMMAND=%~2"
set "STEP_STATUS=OK"
set "STEP_ATTEMPT=1"

echo.
echo %STEP_LABEL%
echo Tentativo 1 di 2...
call %STEP_COMMAND% > "%STEPLOG%" 2>&1
set "STEP_EXIT=%errorlevel%"
type "%STEPLOG%" >> "%LOGFILE%"
>> "%LOGFILE%" echo.

if not "!STEP_EXIT!"=="0" (
  echo Primo tentativo non riuscito. Attendo %RETRY_WAIT_SECONDS% secondi e riprovo...
  >> "%LOGFILE%" echo Primo tentativo fallito per %STEP_LABEL%
  timeout /t %RETRY_WAIT_SECONDS% /nobreak >nul
  set "STEP_ATTEMPT=2"
  echo Tentativo 2 di 2...
  call %STEP_COMMAND% >> "%STEPLOG%" 2>&1
  set "STEP_EXIT=%errorlevel%"
  type "%STEPLOG%" >> "%LOGFILE%"
  >> "%LOGFILE%" echo.
)

if not "!STEP_EXIT!"=="0" (
  set "STEP_STATUS=ERRORE"
  set "HAD_ERROR=1"
) else (
  if "!STEP_ATTEMPT!"=="2" set "STEP_STATUS=OK DOPO RITENTATIVO"
)

>> "%SUMMARYFILE%" echo %STEP_LABEL% - !STEP_STATUS!
if "!STEP_ATTEMPT!"=="2" (
  >> "%SUMMARYFILE%" echo   - Il passaggio e' stato ripetuto automaticamente dopo un primo errore.
)
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\extract-log-highlights.ps1" "%STEPLOG%" >> "%SUMMARYFILE%"
>> "%SUMMARYFILE%" echo.
del "%STEPLOG%" >nul 2>&1
exit /b 0

:runCommand
set "COMMAND_LABEL=%~1"
set "COMMAND_TEXT=%~2"
set "COMMAND_STATUS=OK"

cmd /c %COMMAND_TEXT% > "%STEPLOG%" 2>&1
set "COMMAND_EXIT=%errorlevel%"
type "%STEPLOG%" >> "%LOGFILE%"
>> "%LOGFILE%" echo.

if not "!COMMAND_EXIT!"=="0" set "COMMAND_STATUS=ERRORE"

>> "%SUMMARYFILE%" echo - %COMMAND_LABEL% - !COMMAND_STATUS!
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\extract-log-highlights.ps1" "%STEPLOG%" >> "%SUMMARYFILE%"
del "%STEPLOG%" >nul 2>&1

if not "!COMMAND_EXIT!"=="0" exit /b 1
exit /b 0

:end
pause
exit /b 0
