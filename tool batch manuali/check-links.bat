@echo off
cd /d %~dp0..

echo =========================
echo CONTROLLO LINK PRO
echo =========================

call npm run build
call npm run check:links

pause