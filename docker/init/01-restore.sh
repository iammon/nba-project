#!/bin/bash
set -euo pipefail

DUMP="/docker-entrypoint-initdb.d/nba_snapshot.dump"

if [[ -f "$DUMP" ]]; then
  echo "🔄 Restoring $DUMP into $POSTGRES_DB as $POSTGRES_USER ..."
  # --no-owner/--no-privileges avoids ownership issues across machines
  pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    --no-owner --no-privileges "$DUMP"
  echo "✅ Initial restore complete."
else
  echo "⚠️  Dump not found at $DUMP (skipping)"
fi
