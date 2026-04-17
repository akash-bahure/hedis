#!/usr/bin/env bash
# Generate API clients from OpenAPI specs in packages/contracts/openapi/
# Extend this script to generate typed clients for each app as needed.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
OPENAPI_DIR="$REPO_ROOT/packages/contracts/openapi"

if [ ! -d "$OPENAPI_DIR" ]; then
  echo "No openapi/ directory found — nothing to generate."
  exit 0
fi

echo "==> Generating clients from OpenAPI specs..."

# Example: generate a TypeScript client for the web app
# Uncomment and adapt as needed:
#
# npx --yes openapi-typescript "$OPENAPI_DIR/core-api.yaml" \
#   --output "$REPO_ROOT/packages/sdk/src/core-api.d.ts"
#
# npx --yes @hey-api/openapi-ts \
#   --input "$OPENAPI_DIR/core-api.yaml" \
#   --output "$REPO_ROOT/packages/sdk/src/generated/" \
#   --client fetch

echo "    (No generators configured yet — add your generator commands above)"
echo "==> Done."
