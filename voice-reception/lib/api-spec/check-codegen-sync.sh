#!/usr/bin/env bash
# Verifies that the committed generated client files match what orval would produce
# from the current openapi.yaml. Exits 1 with a clear message if out of sync.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

REACT_GEN="$WORKSPACE_ROOT/lib/api-client-react/src/generated"
ZOD_GEN="$WORKSPACE_ROOT/lib/api-zod/src/generated"

BACKUP_DIR="$(mktemp -d)"
trap 'rm -rf "$BACKUP_DIR"' EXIT

cp -r "$REACT_GEN" "$BACKUP_DIR/api-client-react-generated"
cp -r "$ZOD_GEN" "$BACKUP_DIR/api-zod-generated"

CODEGEN_OK=true
orval --config "$SCRIPT_DIR/orval.config.ts" || CODEGEN_OK=false

DIFF_REACT=$(diff -rq "$BACKUP_DIR/api-client-react-generated" "$REACT_GEN" 2>&1 || true)
DIFF_ZOD=$(diff -rq "$BACKUP_DIR/api-zod-generated" "$ZOD_GEN" 2>&1 || true)

rm -rf "$REACT_GEN" "$ZOD_GEN"
cp -r "$BACKUP_DIR/api-client-react-generated" "$REACT_GEN"
cp -r "$BACKUP_DIR/api-zod-generated" "$ZOD_GEN"

if [[ "$CODEGEN_OK" == "false" ]]; then
  echo ""
  echo "ERROR: orval codegen failed — fix the openapi.yaml or orval config first" >&2
  exit 1
fi

if [[ -n "$DIFF_REACT" || -n "$DIFF_ZOD" ]]; then
  echo "" >&2
  echo "ERROR: generated client is out of sync — run codegen" >&2
  echo "  cd voice-reception && pnpm --filter @workspace/api-spec run codegen" >&2
  echo "" >&2
  if [[ -n "$DIFF_REACT" ]]; then
    echo "Changed in lib/api-client-react/src/generated:" >&2
    echo "$DIFF_REACT" >&2
  fi
  if [[ -n "$DIFF_ZOD" ]]; then
    echo "Changed in lib/api-zod/src/generated:" >&2
    echo "$DIFF_ZOD" >&2
  fi
  exit 1
fi

echo "Generated client is in sync with openapi.yaml."
