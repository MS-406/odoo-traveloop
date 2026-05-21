#!/bin/bash
# start.sh

# Run Alembic migrations
echo "Running Alembic migrations..."
alembic upgrade head

# Start Uvicorn
echo "Starting Uvicorn server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
