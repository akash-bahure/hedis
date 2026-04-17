#!/usr/bin/env bash
# ============================================================
# init.sh — Initialize the monorepo template for a new project
#
# Usage:
#   ./tooling/scripts/init.sh <app-name> <github-org> <domain>
#
# Example:
#   ./tooling/scripts/init.sh acme acme-corp acme.com
#
# What it does:
#   1. (Optional) Bootstraps core-api with cookiecutter-django
#   2. Replaces all placeholder strings in every file
#   3. Renames the myapp/ Django app directory (if not using cookiecutter)
#   4. Prints next steps
# ============================================================

set -euo pipefail

# ---- Argument validation ----------------------------------
if [ "$#" -ne 3 ]; then
  echo "Usage: $0 <app-name> <github-org> <domain>"
  echo ""
  echo "  app-name   — lowercase name used in code (e.g. acme)"
  echo "  github-org — your GitHub organisation slug (e.g. acme-corp)"
  echo "  domain     — your base domain (e.g. acme.com)"
  echo ""
  echo "Example:"
  echo "  $0 acme acme-corp acme.com"
  exit 1
fi

APP_NAME="$1"
GITHUB_ORG="$2"
DOMAIN="$3"

echo ""
echo "==> Initializing monorepo template"
echo "    App name   : $APP_NAME"
echo "    GitHub org : $GITHUB_ORG"
echo "    Domain     : $DOMAIN"
echo ""

# ---- Determine the script's directory (repo root) ---------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$REPO_ROOT"

# ---- Helper: replace in all text files --------------------
replace_in_files() {
  local from="$1"
  local to="$2"
  # Find all text files, skip .git/ and node_modules/ and .venv/
  find . \
    -not -path './.git/*' \
    -not -path './node_modules/*' \
    -not -path './*/.venv/*' \
    -not -path './*/.nx/*' \
    -type f \
    \( -name "*.py" -o -name "*.yml" -o -name "*.yaml" -o -name "*.json" \
       -o -name "*.toml" -o -name "*.ts" -o -name "*.tsx" -o -name "*.js" \
       -o -name "*.jsx" -o -name "*.md" -o -name "*.sh" -o -name "*.conf" \
       -o -name "*.env" -o -name "*.example" -o -name "Makefile" \
       -o -name "Dockerfile" -o -name ".gitignore" \) \
    -exec sed -i.bak "s|${from}|${to}|g" {} \;

  # Remove sed backup files
  find . -name "*.bak" -delete
}

# ---- Ask: cookiecutter-django or placeholder? -------------
USE_COOKIECUTTER=false

echo "==> How would you like to set up core-api?"
echo ""
echo "    [1] Keep built-in placeholder  — rename myapp/ and continue"
echo "    [2] Use cookiecutter-django    — run the interactive generator"
echo "        (https://cookiecutter-django.readthedocs.io)"
echo ""
printf "    Your choice [1/2]: "
read -r CORE_API_CHOICE
echo ""

if [ "$CORE_API_CHOICE" = "2" ]; then
  USE_COOKIECUTTER=true
fi

# ---- Step 1: Bootstrap core-api with cookiecutter-django --
if [ "$USE_COOKIECUTTER" = true ]; then

  # Ensure cookiecutter is available
  if ! command -v cookiecutter &>/dev/null; then
    echo "==> cookiecutter not found — installing ..."
    if command -v pipx &>/dev/null; then
      pipx install cookiecutter
    elif command -v pip &>/dev/null; then
      pip install --user cookiecutter
    elif command -v pip3 &>/dev/null; then
      pip3 install --user cookiecutter
    else
      echo "ERROR: Cannot install cookiecutter. Install it manually:"
      echo "  pip install cookiecutter"
      echo "  or: pipx install cookiecutter"
      exit 1
    fi
  fi

  TMP_OUTPUT="$(mktemp -d)"

  echo "==> Running cookiecutter-django ..."
  echo ""
  echo "    ┌─────────────────────────────────────────────────────┐"
  echo "    │  Suggested values to match your monorepo:           │"
  echo "    │                                                     │"
  echo "    │  project_name  →  $APP_NAME"
  echo "    │  project_slug  →  $APP_NAME  (must match app-name)  │"
  echo "    │  domain_name   →  $DOMAIN"
  echo "    │  use_docker    →  y                                 │"
  echo "    │  use_heroku    →  n                                 │"
  echo "    └─────────────────────────────────────────────────────┘"
  echo ""
  echo "    The interactive prompt will start now ..."
  echo "    Press Ctrl+C to abort."
  echo ""

  cookiecutter gh:cookiecutter/cookiecutter-django \
    --output-dir "$TMP_OUTPUT"

  # Find the generated project directory (cookiecutter creates one dir inside output-dir)
  GENERATED_DIR=""
  for d in "$TMP_OUTPUT"/*/; do
    if [ -d "$d" ]; then
      GENERATED_DIR="${d%/}"
      break
    fi
  done

  if [ -z "$GENERATED_DIR" ]; then
    echo ""
    echo "ERROR: cookiecutter-django did not produce a directory in $TMP_OUTPUT"
    echo "       Aborting. The apps/core-api/ placeholder is untouched."
    rm -rf "$TMP_OUTPUT"
    exit 1
  fi

  PROJECT_SLUG="$(basename "$GENERATED_DIR")"
  echo ""
  echo "==> cookiecutter-django generated: $PROJECT_SLUG/"
  echo "==> Replacing apps/core-api/ ..."

  rm -rf apps/core-api
  mv "$GENERATED_DIR" apps/core-api
  rm -rf "$TMP_OUTPUT"

  echo "    apps/core-api/ is now your cookiecutter-django project."
  echo ""

else
  # ---- Step 2a: Rename Django app directory (placeholder path) ----
  DJANGO_APP_DIR="apps/core-api/myapp"
  if [ -d "$DJANGO_APP_DIR" ]; then
    echo "==> Renaming Django app directory: myapp/ → ${APP_NAME}/ ..."
    mv "$DJANGO_APP_DIR" "apps/core-api/${APP_NAME}"
  else
    echo "    (Django app directory not found at $DJANGO_APP_DIR — skipping rename)"
  fi
fi

# ---- Step 2: Replace placeholder strings ------------------
# Safe to run in both modes:
#   - cookiecutter mode: cookiecutter output won't contain 'myapp', so these
#     replacements are no-ops inside apps/core-api/ and only affect infra/,
#     clusters/, packages/, workflows, and README.
#   - placeholder mode: renames everything everywhere.
echo "==> Replacing 'myapp' → '$APP_NAME' ..."
replace_in_files "myapp" "$APP_NAME"

echo "==> Replacing 'my-org' → '$GITHUB_ORG' ..."
replace_in_files "my-org" "$GITHUB_ORG"

echo "==> Replacing 'example.com' → '$DOMAIN' ..."
replace_in_files "example.com" "$DOMAIN"

# ---- Done -------------------------------------------------
echo ""
echo "============================================================"
echo "  Template initialized successfully!"
echo "============================================================"
echo ""
echo "Next steps:"
echo ""

if [ "$USE_COOKIECUTTER" = true ]; then
  echo "  1. Review all changes:"
  echo "       git diff --stat"
  echo ""
  echo "  2. Follow the cookiecutter-django README inside apps/core-api/"
  echo "       cat apps/core-api/README.rst"
  echo ""
  echo "  3. Set up local environment files:"
  echo "       cp apps/core-api/.envs/.local/.django.example \\"
  echo "          apps/core-api/.envs/.local/.django   # if generated"
  echo "       # Or check: ls apps/core-api/.envs/"
  echo ""
  echo "  4. Start core-api locally (Docker Compose):"
  echo "       make -C apps/core-api local-build"
  echo "       make -C apps/core-api local-up"
  echo ""
else
  echo "  1. Review the changes:"
  echo "       git diff --stat"
  echo ""
  echo "  2. Set up local environment files:"
  echo "       cp apps/core-api/.envs/.local/.django.example apps/core-api/.envs/.local/.django"
  echo "       cp apps/core-api/.envs/.local/.postgres.example apps/core-api/.envs/.local/.postgres"
  echo "       # then edit both files with your values"
  echo ""
  echo "  3. Install dependencies:"
  echo "       bun install              # JavaScript workspaces"
  echo "       cd apps/core-api && uv sync --group dev && cd ../.."
  echo ""
  echo "  4. Start core-api locally:"
  echo "       make -C apps/core-api local-build"
  echo "       make -C apps/core-api local-up"
  echo "       make -C apps/core-api local-manage ARGS='migrate'"
  echo "       make -C apps/core-api local-manage ARGS='createsuperuser'"
  echo ""
fi

echo "  5. Start web locally:"
echo "       make -C apps/web dev"
echo ""
echo "  6. Read the full README for infrastructure & deployment:"
echo "       cat README.md"
echo ""
echo "  Repository: https://github.com/${GITHUB_ORG}/${APP_NAME}-monorepo"
echo ""
