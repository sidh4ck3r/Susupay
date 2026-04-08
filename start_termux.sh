#!/bin/bash

# SusuPay Termux Startup Script - v2.2 (Enhanced for Low Memory)
echo "=========================================="
echo "      SusuPay - Termux Startup Manager"
echo "=========================================="

# 1. Memory Optimization
export NODE_OPTIONS="--max-old-space-size=1024"
echo "[1/5] Checking environment..."
if [ ! -d "client/node_modules" ] || [ ! -d "client/server/node_modules" ]; then
    echo "❌ ERROR: Dependencies not installed."
    echo "Please run: npm install --prefix client && npm install --prefix client/server"
    exit 1
fi
echo "SUCCESS: Environment ready (Memory limit set to 1GB)."

# 2. Start MariaDB (MySQL)
if ! pgrep mariadbd > /dev/null; then
    echo "[2/5] Starting MariaDB..."
    nohup mysqld_safe > /dev/null 2>&1 &
    MAX_RETRIES=15
    COUNT=0
    while ! mariadb-admin -u root ping > /dev/null 2>&1; do
        sleep 2
        COUNT=$((COUNT+1))
        if [ $COUNT -ge $MAX_RETRIES ]; then
            echo "❌ ERROR: MariaDB failed to start."
            exit 1
        fi
    done
    echo "SUCCESS: MariaDB is running."
else
    echo "[2/5] MariaDB is already running."
fi

# 3. Database Initialization
echo "[3/5] Verifying database 'susu_pay_db'..."
mariadb -u root -e "CREATE DATABASE IF NOT EXISTS susu_pay_db;"
echo "SUCCESS: Database ready."

# 4. Port Cleanup
echo "[4/5] Clearing ports 3030 & 5050..."
fuser -k 3030/tcp 2>/dev/null
fuser -k 5050/tcp 2>/dev/null
sleep 1

# 5. Launch Services
echo "[5/5] Launching SusuPay Services..."

# Decide between dev and prod
if [ "$1" == "prod" ]; then
    echo "--- RUNNING IN PRODUCTION MODE (Lighter) ---"
    nohup npm run start --prefix client/server > server.log 2>&1 &
    nohup npm run start --prefix client > client.log 2>&1 &
else
    echo "--- RUNNING IN DEVELOPMENT MODE (Heavy) ---"
    echo "Note: If it crashes, try: ./start_termux.sh prod"
    nohup npm run dev --prefix client/server > server.log 2>&1 &
    nohup npm run dev --prefix client > client.log 2>&1 &
fi

# Health Check Loop
echo "Waiting for services to go live (this may take a minute)..."
MAX_WAIT=90
WAITED=0
while ! curl -s http://localhost:5050/ > /dev/null || ! curl -s http://localhost:3030/ > /dev/null; do
    sleep 5
    WAITED=$((WAITED+5))
    printf "."
    
    # Check if processes are still alive during wait
    if ! pgrep -f "node" > /dev/null; then
        echo -e "\n❌ ERROR: Node processes died during startup. Check client.log/server.log"
        exit 1
    fi

    if [ $WAITED -ge $MAX_WAIT ]; then
        echo -e "\n⚠️ WARNING: Services are taking longer than expected."
        echo "Check server.log and client.log if this persists."
        break
    fi
done

echo ""
echo "=========================================="
echo "  ✅ SUCCESS: SusuPay is Online!"
echo "  - API: http://localhost:5050"
echo "  - App: http://localhost:3030"
echo "  - Logs: tail -f client.log server.log"
echo "=========================================="
echo "TIP: Keep Termux in the foreground during compilation."
