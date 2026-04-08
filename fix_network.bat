@echo off
setlocal
echo ==========================================
echo   SusuPay MASTER NETWORK UNLOCK
echo ==========================================
echo.
echo [1/3] Applying Edge-Traversal Firewall Rules...
netsh advfirewall firewall delete rule name="SusuPay API" >nul 2>&1
netsh advfirewall firewall delete rule name="SusuPay Web" >nul 2>&1

:: Adding rules with edge=yes (Permissive mode)
netsh advfirewall firewall add rule name="SusuPay API" dir=in action=allow protocol=TCP localport=5050 profile=any edge=yes
netsh advfirewall firewall add rule name="SusuPay Web" dir=in action=allow protocol=TCP localport=3030 profile=any edge=yes
echo Done.

echo.
echo [2/3] Available Network Addresses (IPs):
echo ------------------------------------------
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4 Address"') do (
    echo    PHONE URL -> http:%%a:3030
    echo    PING TEST -> http:%%a:5050/ping
)
echo ------------------------------------------
echo.

echo [3/3] Testing Service Listeners...
netstat -ano | findstr :5050 >nul 2>&1
if %errorlevel% equ 0 (
    echo    API [5050] : ONLINE
) else (
    echo    API [5050] : OFFLINE (Run 'npm run dev' in client/server)
)

netstat -ano | findstr :3030 >nul 2>&1
if %errorlevel% equ 0 (
    echo    WEB [3030] : ONLINE
) else (
    echo    WEB [3030] : OFFLINE (Run 'npm run dev' in client)
)

echo.
echo ==========================================
echo   IMPORTANT FOR NETWORK ENGINEERS:
echo ==========================================
echo 1. Your Wi-Fi profile is PUBLIC. Packet dropping is likely.
echo 2. Check for Router 'AP Isolation' or 'Guest Mode'.
echo 3. Check for 3rd-party software (Norton, McAfee, ESET).
echo ==========================================
pause
