@echo off
cd /d %~dp0..

set BACKUP_DIR=backup_%date:~6,4%-%date:~3,2%-%date:~0,2%

echo =========================
echo BACKUP PROGETTO
echo =========================

mkdir %BACKUP_DIR%
xcopy /E /I /Y src %BACKUP_DIR%\src
xcopy /E /I /Y scripts %BACKUP_DIR%\scripts

echo.
echo OK - BACKUP CREATO: %BACKUP_DIR%
pause