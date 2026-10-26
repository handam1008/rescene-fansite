@echo off
rem Double-click to update to the latest code and run the site.
cd /d "%~dp0"

echo [1/3] Getting latest code...
git pull

echo [2/3] Checking packages...
call npm.cmd install --no-audit --no-fund

echo [3/3] Starting site. Close this window to stop it.
start "" cmd /c "timeout /t 8 >/dev/null & start http://localhost:3000"
call npm.cmd run dev
pause
