@echo off
title SusuPay - Dependency Sync
color 0a

echo ==========================================
echo  🔄 SusuPay - Synchronizing Dependencies
echo ==========================================
echo.
echo [1/2] Installing @simplewebauthn/server...
cd /d "%~dp0\server"
npm install @simplewebauthn/server --save

echo.
echo [2/2] Finalizing package-lock.json...
npm install

echo.
echo ==========================================
echo  ✅ DONE! 
echo  Dependencies are now synchronized.
echo ==========================================
echo.
pause
