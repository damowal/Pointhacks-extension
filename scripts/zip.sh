#!/bin/bash

# Creates a distributable ZIP of the extension
# Works without Node.js

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"
DIST="$ROOT/dist"

# Build first if dist doesn't exist
if [ ! -d "$DIST" ]; then
    echo "dist/ not found, building first..."
    "$SCRIPT_DIR/build.sh"
fi

# Get version from manifest
VERSION=$(grep '"version"' "$ROOT/manifest.json" | sed 's/.*: *"\([^"]*\)".*/\1/')
ZIP_NAME="pointhacks-autofill-v${VERSION}.zip"

echo "Creating $ZIP_NAME..."

cd "$DIST"
zip -r "../$ZIP_NAME" . -x "*.DS_Store"
cd "$ROOT"

echo "Created $ZIP_NAME"
echo "Ready for Chrome Web Store upload!"
