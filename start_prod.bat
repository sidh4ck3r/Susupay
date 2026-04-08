@echo off
title SusuPay Production Runner
color 0a

echo ==========================================
echo      SusuPay - PRODUCTION MODE 
echo ==========================================
echo.

echo [1/2] Starting Backend API...
start "SusuPay Backend [PROD]" cmd /k "cd /d "%~dp0client\server" && npm run start"

echo [2/2] Starting Frontend Web App...
start "SusuPay Frontend [PROD]" cmd /k "cd /d "%~dp0client" && npm run start"

echo.
echo ==========================================
echo  SUCCESS: Production services are launching!
echo  - API: http://localhost:5050
echo  - App: http://localhost:3030
echo ==========================================
echo.
pause
