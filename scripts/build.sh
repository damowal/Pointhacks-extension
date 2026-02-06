#!/bin/bash

# Build script for Point Hacks AutoFill Chrome Extension
# Works without Node.js - just copies files to dist/

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"
DIST="$ROOT/dist"

echo "Building extension..."

# Clean
rm -rf "$DIST"
mkdir -p "$DIST/icons"

# Copy files
echo "Copying files..."

# Popup
cp "$ROOT/src/popup/popup.html" "$DIST/"
cp "$ROOT/src/popup/popup.css" "$DIST/"
cp "$ROOT/src/popup/popup.js" "$DIST/"

# Content
cp "$ROOT/src/content/content.js" "$DIST/"
cp "$ROOT/src/content/content.css" "$DIST/"

# Background
cp "$ROOT/src/background/background.js" "$DIST/"

# Libraries
cp "$ROOT/src/lib/firebase-config.js" "$DIST/"
cp "$ROOT/src/lib/auth.js" "$DIST/"
cp "$ROOT/src/lib/sync.js" "$DIST/"
cp "$ROOT/src/lib/address-lookup.js" "$DIST/"
cp "$ROOT/src/lib/email-typeahead.js" "$DIST/"
cp "$ROOT/src/lib/name-typeahead.js" "$DIST/"
cp "$ROOT/src/lib/occupation-typeahead.js" "$DIST/"
cp "$ROOT/src/lib/offers.js" "$DIST/"
cp "$ROOT/src/lib/my-cards.js" "$DIST/"

# Icons
cp "$ROOT/src/assets/icons/"*.png "$DIST/icons/"

# Manifest
cp "$ROOT/manifest.json" "$DIST/"

echo ""
echo "Build complete! Extension ready in dist/"
echo "Load in Chrome: chrome://extensions -> Load unpacked -> select dist/"
