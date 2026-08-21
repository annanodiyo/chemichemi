#!/bin/bash
#
# One-time setup: registers run_pipeline.sh in your crontab to run
# daily at 06:00. Safe to re-run - it won't create duplicate entries.
#
# Usage:
#   ./install_cron.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNNER="$SCRIPT_DIR/run_pipeline.sh"
CRON_LINE="0 6 * * * $RUNNER"

chmod +x "$RUNNER"

# avoid adding a duplicate entry if this has been run before
EXISTING=$(crontab -l 2>/dev/null || true)

if echo "$EXISTING" | grep -Fq "$RUNNER"; then
    echo "Cron entry already exists, nothing to do:"
    echo "$EXISTING" | grep -F "$RUNNER"
else
    (echo "$EXISTING"; echo "$CRON_LINE") | grep -v '^$' | crontab -
    echo "Installed cron entry:"
    echo "  $CRON_LINE"
fi

echo ""
echo "Logs will be written to: $SCRIPT_DIR/logs/pipeline.log"
echo "To test it right now without waiting for 06:00, run:"
echo "  $RUNNER"
echo "To view/edit the schedule later:"
echo "  crontab -e"