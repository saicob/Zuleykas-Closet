How to start the server without typing in a terminal (Windows)

1) Double-click `start-server.bat` in the project root.
   - This starts `node src\index.js` in a minimized background window.
   - Output is written to `server.log` in the project root.

2) Open your browser to:
   http://localhost:3000/

3) To stop the server, double-click `stop-server.bat` (note: this kills all `node.exe` processes).

Notes:
 
- This is a convenience helper; for production you should run the server with a proper process manager (PM2, Windows service, Docker, etc.).
