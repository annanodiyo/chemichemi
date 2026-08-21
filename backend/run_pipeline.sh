#!/bin/bash
#
# Cron wrapper for the water quality pipeline.
# Handles: activating the venv, logging with timestamps, preventing
# overlapping runs, and non-zero exit codes on failure so cron can
# alert you (e.g. via mail) if something breaks.
#
# Usage (called by cron, but you can also run it manually to test):
#   ./run_pipeline.sh

set -euo pipefail

# --- resolve paths relative to this script's location, not the caller's cwd ---
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

VENV_PYTHON="$SCRIPT_DIR/venv/bin/python"
LOG_DIR="$SCRIPT_DIR/logs"
LOG_FILE="$LOG_DIR/pipeline.log"
LOCK_FILE="$SCRIPT_DIR/.pipeline.lock"

mkdir -p "$LOG_DIR"

# --- prevent two runs overlapping if one is still processing a large scene ---
exec 200>"$LOCK_FILE"
if ! flock -n 200; then
    echo "$(date -u '+%Y-%m-%dT%H:%M:%SZ') SKIP - previous run still in progress" >> "$LOG_FILE"
    exit 0
fi

echo "$(date -u '+%Y-%m-%dT%H:%M:%SZ') START" >> "$LOG_FILE"

if [ ! -x "$VENV_PYTHON" ]; then
    echo "$(date -u '+%Y-%m-%dT%H:%M:%SZ') ERROR - venv not found at $VENV_PYTHON. Run: python3 -m venv venv && ./venv/bin/pip install -r requirements.txt" >> "$LOG_FILE"
    exit 1
fi

if [ ! -f "$SCRIPT_DIR/.env" ]; then
    echo "$(date -u '+%Y-%m-%dT%H:%M:%SZ') ERROR - .env not found. Copy .env.example to .env and fill in credentials." >> "$LOG_FILE"
    exit 1
fi

# --- run the pipeline, capturing both stdout and stderr with timestamps ---
if "$VENV_PYTHON" -m app.pipeline >> "$LOG_FILE" 2>&1; then
    echo "$(date -u '+%Y-%m-%dT%H:%M:%SZ') SUCCESS" >> "$LOG_FILE"
else
    STATUS=$?
    echo "$(date -u '+%Y-%m-%dT%H:%M:%SZ') FAILED (exit code $STATUS)" >> "$LOG_FILE"
    exit "$STATUS"
fi

# --- keep the log from growing forever: trim to the last 5000 lines ---
tail -n 5000 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"