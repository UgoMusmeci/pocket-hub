@echo off
cd /d %~dp0..

echo =========================
echo UPDATE CARDS
echo =========================

call npm run sync:cards
if %errorlevel% neq 0 goto errore

call npm run autofix:content
if %errorlevel% neq 0 goto errore

pause
exit /b

:errore
echo.
echo ERRORE DURANTE UPDATE CARDS
pause
exit /b
