@echo off
REM Stops node processes. Note: this will terminate all node.exe processes on the machine.
echo Stopping node processes (this may kill unrelated Node apps)...
taskkill /IM node.exe /F
echo Done.
exit /b 0
