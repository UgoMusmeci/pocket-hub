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
set "COMMAND_FILE=%TEMP%\pocket_hub_command.cmd"
set "HAD_ERROR=0"
set "PUSH_CHOICE="
set "REBASE_CHOICE="
set "BRANCH_NAME="
set "RETRY_WAIT_SECONDS=3"
set "LOCK_WAIT_SECONDS=5"
set "LOCK_CHECK_MAX=3"
set "REBASE_RESOLVED=0"

echo =========================
echo AVVIO AGGIORNAMENTO
echo =========================

> "%LOGFILE%" echo Avvio: %date% %time%
> "%SUMMARYFILE%" echo RIEPILOGO AGGIORNAMENTO - %date% %time%
>> "%SUMMARYFILE%" echo.

call :runStep "[1/8] Sync CARDS..." "npm run sync:cards"
call :runStep "[2/8] Verifica ESPANSIONI..." "node scripts/report-content-health.mjs"
call :runStep "[3/8] Sync MAZZI..." "npm run sync:decks"
call :runStep "[4/8] Sync EVENT ASSETS..." "npm run sync:events:assets"
call :runStep "[5/8] Sync REWARDS..." "npm run sync:rewards"
call :runStep "[6/8] AUTO-FIX CONTENUTI..." "npm run autofix:content"
call :runStep "[7/8] AUDIT CONTENUTI..." "npm run audit:all"
call :runStep "[8/8] BUILD SITO..." "npm run build"

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

call :prepareGitForPush
if errorlevel 1 goto pushFailed

git status --porcelain > "%TEMP%\pocket_hub_git_status.txt"
for %%A in ("%TEMP%\pocket_hub_git_status.txt") do set "GIT_STATUS_SIZE=%%~zA"
for /f "delims=" %%A in ('git branch --show-current') do set "BRANCH_NAME=%%A"
if "!BRANCH_NAME!"=="" set "BRANCH_NAME=main"

if not "!GIT_STATUS_SIZE!"=="0" (
  call :runCommand "Preparazione commit locale" "git add -A"
  if errorlevel 1 goto pushFailed
  call :runCommand "Commit locale" "git commit -m chore-update-content"
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
  call :attemptKnownRebaseRecovery
  if "!REBASE_RESOLVED!"=="1" (
    call :runCommand "Secondo tentativo di push" "git push origin HEAD:!BRANCH_NAME!"
    if errorlevel 1 goto pushFailed
    goto pushOk
  )

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

:prepareGitForPush
set "LOCK_ATTEMPT=1"

:prepareGitForPushCheck
if not exist ".git\index.lock" exit /b 0

tasklist /FI "IMAGENAME eq git.exe" | find /I "git.exe" >nul
if errorlevel 1 goto removeStaleGitLock

if "!LOCK_ATTEMPT!"=="!LOCK_CHECK_MAX!" goto activeGitLockDetected

echo Operazione Git ancora attiva. Attendo %LOCK_WAIT_SECONDS% secondi e ricontrollo...
>> "%LOGFILE%" echo Lock Git rilevato con processo git.exe attivo. Attendo %LOCK_WAIT_SECONDS% secondi e ricontrollo...
timeout /t %LOCK_WAIT_SECONDS% /nobreak >nul
set /a LOCK_ATTEMPT+=1
goto prepareGitForPushCheck

:removeStaleGitLock
del /f /q ".git\index.lock" >nul 2>&1
if exist ".git\index.lock" (
  echo Non sono riuscito a rimuovere il lock Git automaticamante.
  >> "%SUMMARYFILE%" echo - Lock Git trovato ma non rimovibile automaticamente.
  >> "%LOGFILE%" echo Impossibile rimuovere .git\index.lock
  exit /b 1
)

echo Lock Git precedente rilevato e rimosso automaticamente.
>> "%SUMMARYFILE%" echo - Lock Git precedente rilevato e rimosso automaticamente.
>> "%LOGFILE%" echo Lock Git precedente rilevato e rimosso automaticamente.
exit /b 0

:activeGitLockDetected
echo Ho trovato un'operazione Git ancora in corso. Interrompo il push per evitare danni.
echo Chiudi eventuali finestre batch o Git ancora aperte, poi rilancia il push.
>> "%SUMMARYFILE%" echo - Git risulta ancora in esecuzione: push interrotto per sicurezza.
>> "%SUMMARYFILE%" echo   - Chiudi eventuali finestre batch o Git ancora aperte, poi riprova.
>> "%LOGFILE%" echo Lock Git presente con processi git.exe ancora attivi. Push interrotto per sicurezza.
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

> "%COMMAND_FILE%" echo @echo off
>> "%COMMAND_FILE%" echo !COMMAND_TEXT!
call "%COMMAND_FILE%" > "%STEPLOG%" 2>&1
set "COMMAND_EXIT=%errorlevel%"
type "%STEPLOG%" >> "%LOGFILE%"
>> "%LOGFILE%" echo.

if not "!COMMAND_EXIT!"=="0" set "COMMAND_STATUS=ERRORE"

>> "%SUMMARYFILE%" echo - %COMMAND_LABEL% - !COMMAND_STATUS!
powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\extract-log-highlights.ps1" "%STEPLOG%" >> "%SUMMARYFILE%"
del "%STEPLOG%" >nul 2>&1
del "%COMMAND_FILE%" >nul 2>&1

if not "!COMMAND_EXIT!"=="0" exit /b 1
exit /b 0

:attemptKnownRebaseRecovery
set "REBASE_RESOLVED=0"
echo.
echo Verifico se il conflitto del rebase e' risolvibile automaticamente...
>> "%SUMMARYFILE%" echo - Tentativo risoluzione automatica conflitti rebase

git diff --name-only --diff-filter=U > "%TEMP%\pocket_hub_rebase_conflicts.txt"
git status --porcelain > "%TEMP%\pocket_hub_rebase_status.txt"
for %%A in ("%TEMP%\pocket_hub_rebase_conflicts.txt") do set "REBASE_CONFLICT_SIZE=%%~zA"
for %%A in ("%TEMP%\pocket_hub_rebase_status.txt") do set "REBASE_STATUS_SIZE=%%~zA"

if exist ".git\rebase-merge" (
  if "!REBASE_CONFLICT_SIZE!"=="0" if "!REBASE_STATUS_SIZE!"=="0" (
    set "RESOLVE_STATUS=OK"
    > "%COMMAND_FILE%" echo @echo off
    >> "%COMMAND_FILE%" echo set GIT_EDITOR=true
    >> "%COMMAND_FILE%" echo git rebase --continue
    call "%COMMAND_FILE%" > "%STEPLOG%" 2>&1
    set "RESOLVE_EXIT=!errorlevel!"
    type "%STEPLOG%" >> "%LOGFILE%"
    >> "%LOGFILE%" echo.

    if not "!RESOLVE_EXIT!"=="0" set "RESOLVE_STATUS=ERRORE"
    >> "%SUMMARYFILE%" echo   - Rebase gia' aperto senza conflitti - !RESOLVE_STATUS!
    powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\extract-log-highlights.ps1" "%STEPLOG%" >> "%SUMMARYFILE%"
    del "%STEPLOG%" >nul 2>&1
    del "%COMMAND_FILE%" >nul 2>&1
    del "%TEMP%\pocket_hub_rebase_conflicts.txt" >nul 2>&1
    del "%TEMP%\pocket_hub_rebase_status.txt" >nul 2>&1

    if "!RESOLVE_EXIT!"=="0" (
      set "REBASE_RESOLVED=1"
      echo Rebase gia' aperto completato automaticamente.
      exit /b 0
    )
  )
)

findstr /R /C:"^public/data/catalog\.json$" "%TEMP%\pocket_hub_rebase_conflicts.txt" >nul
if not errorlevel 1 (
  set "RESOLVE_STATUS=OK"
  > "%COMMAND_FILE%" echo @echo off
  >> "%COMMAND_FILE%" echo git checkout --theirs public/data/catalog.json
  >> "%COMMAND_FILE%" echo git add public/data/catalog.json
  if exist ".git\rebase-merge" (
    >> "%COMMAND_FILE%" echo set GIT_EDITOR=true
    >> "%COMMAND_FILE%" echo git rebase --continue
  )
  call "%COMMAND_FILE%" > "%STEPLOG%" 2>&1
  set "RESOLVE_EXIT=%errorlevel%"
  type "%STEPLOG%" >> "%LOGFILE%"
  >> "%LOGFILE%" echo.

  if not "!RESOLVE_EXIT!"=="0" set "RESOLVE_STATUS=ERRORE"
  >> "%SUMMARYFILE%" echo   - Conflitto catalogo generato - !RESOLVE_STATUS!
  powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\extract-log-highlights.ps1" "%STEPLOG%" >> "%SUMMARYFILE%"
  del "%STEPLOG%" >nul 2>&1
  del "%COMMAND_FILE%" >nul 2>&1
  del "%TEMP%\pocket_hub_rebase_conflicts.txt" >nul 2>&1
  del "%TEMP%\pocket_hub_rebase_status.txt" >nul 2>&1

  if "!RESOLVE_EXIT!"=="0" (
    set "REBASE_RESOLVED=1"
    echo Rebase ripristinato automaticamente usando il catalogo locale aggiornato.
  )

  exit /b 0
)

>> "%SUMMARYFILE%" echo   - Nessun conflitto noto risolvibile in automatico.
del "%TEMP%\pocket_hub_rebase_conflicts.txt" >nul 2>&1
del "%TEMP%\pocket_hub_rebase_status.txt" >nul 2>&1

exit /b 0

:end
pause
exit /b 0
