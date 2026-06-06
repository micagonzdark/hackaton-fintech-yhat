#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DB_PATH="${ROOT_DIR}/backend/seed/demo_credit.db"
SCHEMA_PATH="${ROOT_DIR}/backend/schema.sql"

sqlite3 "${DB_PATH}" < "${SCHEMA_PATH}"

echo "Demo database created at ${DB_PATH}"
echo "Example:"
echo "sqlite3 ${DB_PATH} \"SELECT h.display_name, o.final_score, o.decision, o.recommended_advance_ars FROM credit_offers o JOIN hosts h ON h.host_id = o.host_id ORDER BY o.final_score DESC;\""
