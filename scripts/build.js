#!/usr/bin/env node

/**
 * Build script for Point Hacks AutoFill Chrome Extension
 * Copies source files to dist/ directory in the structure Chrome expects
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');
const DIST = path.join(ROOT, 'dist');

// File mapping: source -> destination (relative to dist/)
const FILE_MAP = {
  // Popup
  'src/popup/popup.html': 'popup.html',
  'src/popup/popup.css': 'popup.css',
  'src/popup/popup.js': 'popup.js',

  // Content scripts
  'src/content/content.js': 'content.js',
  'src/content/content.css': 'content.css',

  // Background
  'src/background/background.js': 'background.js',

  // Libraries (loaded by popup.html)
  'src/lib/firebase-config.js': 'firebase-config.js',
  'src/lib/auth.js': 'auth.js',
  'src/lib/sync.js': 'sync.js',
  'src/lib/address-lookup.js': 'address-lookup.js',
  'src/lib/email-typeahead.js': 'email-typeahead.js',
  'src/lib/name-typeahead.js': 'name-typeahead.js',
  'src/lib/occupation-typeahead.js': 'occupation-typeahead.js',
  'src/lib/offers.js': 'offers.js',
  'src/lib/my-cards.js': 'my-cards.js',

  // Manifest
  'manifest.json': 'manifest.json',
};

// Directories to copy entirely
const DIR_MAP = {
  'src/assets/icons': 'icons',
};

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') throw err;
  }
}

async function copyFile(src, dest) {
  await ensureDir(path.dirname(dest));
  await fs.copyFile(src, dest);
  console.log(`  ${path.relative(ROOT, src)} -> ${path.relative(ROOT, dest)}`);
}

async function copyDir(src, dest) {
  await ensureDir(dest);
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

async function clean() {
  try {
    await fs.rm(DIST, { recursive: true, force: true });
    console.log('Cleaned dist/');
  } catch (err) {
    // Ignore if doesn't exist
  }
}

async function build() {
  console.log('Building extension...\n');

  await clean();
  await ensureDir(DIST);

  // Copy individual files
  console.log('Copying files:');
  for (const [src, dest] of Object.entries(FILE_MAP)) {
    await copyFile(path.join(ROOT, src), path.join(DIST, dest));
  }

  // Copy directories
  console.log('\nCopying directories:');
  for (const [src, dest] of Object.entries(DIR_MAP)) {
    console.log(`  ${src}/ -> dist/${dest}/`);
    await copyDir(path.join(ROOT, src), path.join(DIST, dest));
  }

  console.log('\nBuild complete! Extension ready in dist/');
  console.log('Load it in Chrome: chrome://extensions -> Load unpacked -> select dist/');
}

// Watch mode
async function watch() {
  const chokidar = await import('chokidar');

  console.log('Watching for changes... (Ctrl+C to stop)\n');
  await build();

  const watcher = chokidar.watch([SRC, path.join(ROOT, 'manifest.json')], {
    ignoreInitial: true,
    persistent: true,
  });

  watcher.on('all', async (event, filePath) => {
    console.log(`\n[${event}] ${path.relative(ROOT, filePath)}`);
    await build();
  });
}

// Main
const args = process.argv.slice(2);
if (args.includes('--watch') || args.includes('-w')) {
  watch();
} else {
  build();
}
