#!/bin/sh

# Stop immediately if any command fails
set -e

echo "--- STARTING CONTAINER SETUP (using node/mysql2 health check) ---"

# ---------------------------------------------
# 1. Wait for MySQL to be ready (using Node.js and mysql2 library)
# This is the most reliable method in a Node container as it checks
# using the exact credentials and driver your application uses.
# ---------------------------------------------
echo "📌 Waiting for MySQL to be ready..."

RETRY_COUNT=0
MAX_RETRIES=15

until node -e "
const mysql = require('mysql2');
const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD
});

// Try to connect. If an error occurs (like connection refused), exit with code 1.
conn.connect(err => {
  if (err) {
    console.error('MySQL Connection Failed:', err.code);
    process.exit(1);
  }
  conn.end();
  process.exit(0);
});
// Ensure the process doesn't hang if connection fails immediately
conn.on('error', () => process.exit(1));
"; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo '❌ ERROR: Max connection retries reached. MySQL not responding. Exiting.' >&2
    exit 1
  fi
  echo "⏳ MySQL not ready — retrying in 2s... (Attempt $RETRY_COUNT/$MAX_RETRIES)"
  sleep 2
done

echo "✅ MySQL ready! Connection established."

# ---------------------------------------------
# 2. Run Database Migrations/Seeds
# ---------------------------------------------
echo "🚀 Running database production command: 'npm run db:prod'"

# If this command fails (e.g., migration error), 'set -e' at the top
# ensures the container exits here, making the error visible in logs.
npm run db:prod

echo "✅ Database command completed successfully."

# ---------------------------------------------
# 3. Start Application
# ---------------------------------------------
echo "✨ Starting application with 'npm start'"

# Use 'exec' to replace the current shell process with the 'npm start' process.
# This ensures proper signal handling (SIGTERM, etc.) from Docker.
exec npm start

echo "--- END OF SCRIPT (Should not be reached) ---"
