@echo off
REM Start the Zuleykas server in a minimized background window and log output to server.log
cd /d "%~dp0"
echo Starting server (node src\index.js) ...
start "Zuleykas Server" /min cmd /c "node src\index.js > server.log 2>&1"
echo Server started (logs -> %~dp0server.log)
echo Open http://localhost:3000/ in your browser when ready.
exit /b 0
