#!/usr/bin/env bash
# Validate all OpenAPI specs in packages/contracts/openapi/
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
OPENAPI_DIR="$REPO_ROOT/packages/contracts/openapi"

if [ ! -d "$OPENAPI_DIR" ]; then
  echo "No openapi/ directory found at $OPENAPI_DIR"
  exit 0
fi

SPECS=$(find "$OPENAPI_DIR" -name "*.yaml" -o -name "*.yml" -o -name "*.json")

if [ -z "$SPECS" ]; then
  echo "No OpenAPI specs found in $OPENAPI_DIR"
  exit 0
fi

echo "==> Validating OpenAPI specs..."

for spec in $SPECS; do
  echo "    Checking: $spec"
  # Uses @redocly/cli if available, falls back to a basic YAML parse
  if command -v redocly &>/dev/null; then
    redocly lint "$spec"
  elif command -v npx &>/dev/null; then
    npx --yes @redocly/cli lint "$spec"
  else
    echo "    (redocly CLI not found — skipping deep validation)"
    # At minimum verify it's valid YAML/JSON
    if [[ "$spec" == *.json ]]; then
      python3 -c "import json, sys; json.load(open('$spec'))" && echo "    Valid JSON"
    else
      python3 -c "import yaml, sys; yaml.safe_load(open('$spec'))" && echo "    Valid YAML"
    fi
  fi
done

echo "==> All specs validated."
