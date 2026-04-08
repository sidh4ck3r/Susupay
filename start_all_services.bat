@echo off
echo Starting SusuPay Services...

echo [1/2] Starting Backend (Port 5050)...
start "SusuPay Backend" cmd /k "cd /d c:\xampp\htdocs\SusuPay\client\server && npm run dev"

echo [2/2] Starting Frontend (Port 3030)...
start "SusuPay Frontend" cmd /k "cd /d c:\xampp\htdocs\SusuPay\client && npm run dev"

echo Done.
