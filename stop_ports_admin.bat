@echo off
echo Finding and stopping processes on ports 4000 and 4001...

FOR /F "tokens=5" %%P IN ('netstat -a -n -o ^| findstr :4000') DO (
    echo Found process %%P on Port 4000. Killing...
    taskkill /F /PID %%P
)

FOR /F "tokens=5" %%P IN ('netstat -a -n -o ^| findstr :4001') DO (
    echo Found process %%P on Port 4001. Killing...
    taskkill /F /PID %%P
)

echo.
echo Process cleanup complete.
pause
