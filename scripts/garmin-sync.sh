#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$SCRIPT_DIR/.garmin-sync.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing $ENV_FILE — copy .garmin-sync.env.example and fill in your credentials"
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

cd "$PROJECT_DIR"
exec npx tsx scripts/garmin-sync.ts
