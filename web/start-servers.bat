@echo off
echo Starting RoadWise TMS Servers...
echo.

echo Starting Backend Server (Port 3001)...
start "Backend Server" cmd /k "cd roadwise-tms-backend && npm start"

echo Waiting 3 seconds for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Frontend Server (Port 5173)...
start "Frontend Server" cmd /k "cd roadwise-tms && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window...
pause > nul 