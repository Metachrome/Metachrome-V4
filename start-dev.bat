@echo off
echo Starting METACHROME V2 in Development Mode...
echo.
echo This will start:
echo 1. Frontend development server with hot reload (port 5173)
echo 2. Backend server (port 3001)
echo.

start "Frontend Dev Server" cmd /k "cd client && npm run dev"
timeout /t 3
start "Backend Server" cmd /k "node working-server.js"

echo.
echo ✅ Development servers starting...
echo 🌐 Frontend: http://localhost:5173
echo 🔧 Backend: http://localhost:3001
echo 📊 Admin: http://localhost:5173/admin
echo.
echo Press any key to close this window...
pause > nul
