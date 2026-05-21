@echo off
cd /d %~dp0..

echo =========================
echo UPDATE EVENTS
echo =========================

call npm run sync:events:assets

pause