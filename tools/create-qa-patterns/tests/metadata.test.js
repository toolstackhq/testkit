const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const {
  analyzeUpgrade,
  applySafeUpdates,
  readProjectMetadata,
  renderTemplateFile,
  writeProjectMetadata
} = require('../lib/metadata');
const {
  DEFAULT_GITIGNORE,
  MANAGED_FILE_PATTERNS,
  METADATA_FILENAME
} = require('../lib/constants');
const { getTemplateDirectory, toPackageName } = require('../lib/templates');

const metadataOptions = {
  cliPackageVersion: '1.0.14',
  defaultGitignore: DEFAULT_GITIGNORE,
  getTemplateDirectory: (templateId) =>
    getTemplateDirectory(path.resolve(__dirname, '..'), templateId),
  managedPatterns: MANAGED_FILE_PATTERNS,
  metadataFilename: METADATA_FILENAME,
  toPackageName
};

const template = {
  id: 'playwright-template',
  defaultPackageName: 'playwright-template'
};

function prepareScaffoldBaseline(targetDirectory) {
  fs.cpSync(
    metadataOptions.getTemplateDirectory(template.id),
    targetDirectory,
    { recursive: true }
  );

  for (const relativePath of ['package.json', 'package-lock.json']) {
    const absolutePath = path.join(targetDirectory, relativePath);
    fs.writeFileSync(
      absolutePath,
      renderTemplateFile(
        template,
        relativePath,
        targetDirectory,
        metadataOptions
      ),
      'utf8'
    );
  }
}

test('analyzeUpgrade reports up-to-date state for a fresh scaffold baseline', () => {
  const targetDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'qa-patterns-meta-')
  );
  prepareScaffoldBaseline(targetDirectory);
  writeProjectMetadata(template, targetDirectory, undefined, metadataOptions);

  const metadata = readProjectMetadata(targetDirectory, METADATA_FILENAME);
  const results = analyzeUpgrade(
    template,
    targetDirectory,
    metadata,
    metadataOptions
  );

  assert.equal(
    results.every((entry) => entry.status === 'up-to-date'),
    true
  );
});

test('analyzeUpgrade reports conflicts for user-edited managed files', () => {
  const targetDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'qa-patterns-meta-')
  );
  prepareScaffoldBaseline(targetDirectory);
  writeProjectMetadata(template, targetDirectory, undefined, metadataOptions);

  const packageJsonPath = path.join(targetDirectory, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  packageJson.name = `${packageJson.name}-custom`;
  fs.writeFileSync(
    packageJsonPath,
    `${JSON.stringify(packageJson, null, 2)}\n`,
    'utf8'
  );

  const metadata = readProjectMetadata(targetDirectory, METADATA_FILENAME);
  const results = analyzeUpgrade(
    template,
    targetDirectory,
    metadata,
    metadataOptions
  );
  const packageResult = results.find(
    (entry) => entry.relativePath === 'package.json'
  );

  assert.equal(packageResult.status, 'conflict');
});

test('applySafeUpdates adopts a missing managed baseline entry', () => {
  const targetDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), 'qa-patterns-meta-')
  );
  prepareScaffoldBaseline(targetDirectory);
  writeProjectMetadata(template, targetDirectory, undefined, metadataOptions);

  const metadataPath = path.join(targetDirectory, METADATA_FILENAME);
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  delete metadata.managedFiles['.github/workflows/playwright-tests.yml'];
  fs.writeFileSync(
    metadataPath,
    `${JSON.stringify(metadata, null, 2)}\n`,
    'utf8'
  );

  const nextMetadata = readProjectMetadata(targetDirectory, METADATA_FILENAME);
  const results = analyzeUpgrade(
    template,
    targetDirectory,
    nextMetadata,
    metadataOptions
  );
  const outcome = applySafeUpdates(
    targetDirectory,
    nextMetadata,
    results,
    metadataOptions
  );

  assert.equal(outcome.appliedCount >= 1, true);
  const updatedMetadata = readProjectMetadata(
    targetDirectory,
    METADATA_FILENAME
  );
  assert.ok(
    updatedMetadata.managedFiles['.github/workflows/playwright-tests.yml']
  );
});
