#!/usr/bin/env bash
# Verifies that the committed generated client files match what orval would produce
# from the current openapi.yaml. Exits 1 with a clear message if out of sync.
#
# Uses orval.check.config.ts (prettier: false, temp output dir) so the check
# is significantly faster than the full codegen — no formatting pass, no
# backup/restore of in-place files.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

REACT_GEN="$WORKSPACE_ROOT/lib/api-client-react/src/generated"
ZOD_GEN="$WORKSPACE_ROOT/lib/api-zod/src/generated"

TMP_ROOT="$(mktemp -d)"
trap 'rm -rf "$TMP_ROOT"' EXIT

export ORVAL_CHECK_TMP_ROOT="$TMP_ROOT"

CODEGEN_OK=true
orval --config "$SCRIPT_DIR/orval.check.config.ts" || CODEGEN_OK=false

if [[ "$CODEGEN_OK" == "false" ]]; then
  echo "" >&2
  echo "ERROR: orval codegen failed — fix the openapi.yaml or orval config first" >&2
  exit 1
fi

DIFF_REACT=$(diff -rq "$TMP_ROOT/api-client-react/generated" "$REACT_GEN" 2>&1 || true)
DIFF_ZOD=$(diff -rq "$TMP_ROOT/api-zod/generated" "$ZOD_GEN" 2>&1 || true)

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
