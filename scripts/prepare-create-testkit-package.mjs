#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_ROOT = path.join(ROOT, 'templates');
const DEST_ROOT = path.join(ROOT, 'tools', 'create-testkit', 'templates');
const TEMPLATE_NAMES = [
  'playwright-template',
  'cypress-template',
  'wdio-template'
];
const EXCLUDE = new Set([
  'node_modules',
  'test-results',
  'playwright-report',
  'allure-results',
  'allure-report',
  'reports',
  '.env'
]);

function copyDirFiltered(sourceDirectory, destinationDirectory) {
  fs.mkdirSync(destinationDirectory, { recursive: true });

  for (const entry of fs.readdirSync(sourceDirectory, {
    withFileTypes: true
  })) {
    if (EXCLUDE.has(entry.name)) {
      continue;
    }

    const sourcePath = path.join(sourceDirectory, entry.name);
    const destinationPath = path.join(destinationDirectory, entry.name);

    if (entry.isDirectory()) {
      copyDirFiltered(sourcePath, destinationPath);
      continue;
    }

    fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
    fs.copyFileSync(sourcePath, destinationPath);
  }
}

if (process.argv.includes('--clean')) {
  fs.rmSync(DEST_ROOT, { recursive: true, force: true });
  console.log('Removed generated create-testkit package templates.');
  process.exit(0);
}

fs.rmSync(DEST_ROOT, { recursive: true, force: true });
fs.mkdirSync(DEST_ROOT, { recursive: true });

for (const templateName of TEMPLATE_NAMES) {
  const sourceDirectory = path.join(SOURCE_ROOT, templateName);
  const destinationDirectory = path.join(DEST_ROOT, templateName);

  if (!fs.existsSync(sourceDirectory)) {
    throw new Error(`Template source not found: ${sourceDirectory}`);
  }

  copyDirFiltered(sourceDirectory, destinationDirectory);
  console.log(`Bundled template for package: ${templateName}`);
}
