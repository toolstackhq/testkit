const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { DEFAULT_GITIGNORE, TEMPLATE_CATALOG } = require('../lib/constants');
const {
  createLocalCredentials,
  writeGeneratedLocalEnv
} = require('../lib/local-env');
const { scaffoldProject } = require('../lib/scaffold');
const { getTemplateDirectory, toPackageName } = require('../lib/templates');

const rootDirectory = path.resolve(__dirname, '..');

function renderProgress() {}

function initializeGitRepository(targetDirectory) {
  fs.mkdirSync(path.join(targetDirectory, '.git'), { recursive: true });
}

function scaffoldNoApiProject(templateId) {
  const template = TEMPLATE_CATALOG.find((entry) => entry.id === templateId);
  const targetDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), `qa-patterns-${templateId}-`)
  );

  return scaffoldProject(
    template,
    targetDirectory,
    { git: true },
    {
      createLocalCredentials,
      defaultGitignore: DEFAULT_GITIGNORE,
      getTemplateDirectory: (id) => getTemplateDirectory(rootDirectory, id),
      initializeGitRepository,
      renderProgress,
      toPackageName,
      withApi: false,
      writeGeneratedLocalEnv
    }
  ).then(() => targetDirectory);
}

test('scaffoldProject strips API runtime wiring for cypress when withApi is false', async () => {
  const targetDirectory = await scaffoldNoApiProject('cypress-template');
  const runScript = fs.readFileSync(
    path.join(targetDirectory, 'scripts', 'run-cypress.mjs'),
    'utf8'
  );
  const cypressConfig = fs.readFileSync(
    path.join(targetDirectory, 'cypress.config.ts'),
    'utf8'
  );

  assert.equal(
    fs.existsSync(path.join(targetDirectory, 'demo-apps', 'api-demo-server')),
    false
  );
  assert.equal(
    fs.existsSync(path.join(targetDirectory, 'utils', 'api-client')),
    false
  );
  assert.doesNotMatch(runScript, /demo:api/);
  assert.doesNotMatch(runScript, /apiHealthUrl/);
  assert.doesNotMatch(runScript, /shouldAutoStartApiServer/);
  assert.doesNotMatch(cypressConfig, /registerApiTasks/);
  assert.doesNotMatch(cypressConfig, /apiBaseUrl/);
});

test('scaffoldProject strips API runtime wiring for wdio when withApi is false', async () => {
  const targetDirectory = await scaffoldNoApiProject('wdio-template');
  const runScript = fs.readFileSync(
    path.join(targetDirectory, 'scripts', 'run-wdio.mjs'),
    'utf8'
  );

  assert.equal(
    fs.existsSync(path.join(targetDirectory, 'demo-apps', 'api-demo-server')),
    false
  );
  assert.equal(
    fs.existsSync(path.join(targetDirectory, 'utils', 'api-client')),
    false
  );
  assert.equal(
    fs.existsSync(path.join(targetDirectory, 'utils', 'api-helper.ts')),
    false
  );
  assert.doesNotMatch(runScript, /demo:api/);
  assert.doesNotMatch(runScript, /apiHealthUrl/);
  assert.doesNotMatch(runScript, /shouldAutoStartApiServer/);
});
