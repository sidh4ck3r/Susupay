@echo off
title SusuPay Startup Manager
color 0b

echo ==========================================
echo       SusuPay - Digital Savings 
echo ==========================================
echo.
echo [0/3] Clearing previous sessions...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3030 ^| findstr LISTENING 2^>nul') do (
    taskkill /f /pid %%a 2>nul
)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5050 ^| findstr LISTENING 2^>nul') do (
    taskkill /f /pid %%a 2>nul
)

echo [1/3] Starting Backend API Server (Port 5050)...
start "SusuPay Backend" cmd /k "cd /d "%~dp0client\server" && npm run dev"

echo [2/3] Starting Frontend Web App (Port 3030)...
start "SusuPay Frontend" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo [3/3] Opening Web Browser...
start http://localhost:3030

echo.
echo ==========================================
echo  SUCCESS: Services are launching!
echo  - API: http://localhost:5050
echo  - App: http://localhost:3030
echo ==========================================
echo.
pause
