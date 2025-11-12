#!/bin/sh

# Stop immediately if any command fails (crucial for migration step)
set -e

echo "--- STARTING CONTAINER SETUP ---"

# ---------------------------------------------
# 1. Wait for MySQL TCP Port to be ready (using Netcat)
# ---------------------------------------------
echo "📌 Waiting for MySQL ($DB_HOST:$DB_PORT) to be ready..."

RETRY_COUNT=0
MAX_RETRIES=15

# Note: nc -z checks if the port is open without sending data.
until nc -z $DB_HOST $DB_PORT; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "❌ ERROR: Max connection retries reached. MySQL port is not opening. Exiting." >&2
    exit 1
  fi
  echo "⏳ MySQL not ready — retrying in 2s... (Attempt $RETRY_COUNT/$MAX_RETRIES)"
  sleep 2
done

echo "✅ MySQL port is open."

# ---------------------------------------------
# 2. Run Database Migrations/Seeds
# ---------------------------------------------
echo "🚀 Running database production command: 'npm run db:prod'"

# If npm run db:prod fails, 'set -e' at the top will ensure the script exits here.
npm run db:prod

echo "✅ Database command completed successfully."

# ---------------------------------------------
# 3. Start Application
# ---------------------------------------------
echo "✨ Starting application with 'npm start'"

# Use 'exec' to replace the current shell process with the 'npm start' process.
exec npm start

# This line should never be reached
echo "--- END OF SCRIPT ---"
