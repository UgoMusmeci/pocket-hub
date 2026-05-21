@echo off
cd /d %~dp0..

echo =========================
echo UPDATE CARDS
echo =========================

call npm run sync:cards

pause