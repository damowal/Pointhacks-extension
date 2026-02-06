#!/usr/bin/env node

/**
 * Creates a distributable ZIP file of the extension
 */

import { createWriteStream, promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

async function createZip() {
  // Read version from manifest
  const manifest = JSON.parse(await fs.readFile(path.join(ROOT, 'manifest.json'), 'utf8'));
  const version = manifest.version;
  const zipName = `pointhacks-autofill-v${version}.zip`;
  const zipPath = path.join(ROOT, zipName);

  // Check dist exists
  try {
    await fs.access(DIST);
  } catch {
    console.error('Error: dist/ not found. Run "npm run build" first.');
    process.exit(1);
  }

  console.log(`Creating ${zipName}...`);

  const output = createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    const size = (archive.pointer() / 1024).toFixed(2);
    console.log(`Created ${zipName} (${size} KB)`);
    console.log('Ready for Chrome Web Store upload!');
  });

  archive.on('error', err => {
    throw err;
  });

  archive.pipe(output);
  archive.directory(DIST, false);
  await archive.finalize();
}

createZip();
