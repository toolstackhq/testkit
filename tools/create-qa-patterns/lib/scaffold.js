const fs = require('node:fs');
const path = require('node:path');
const { renderTemplateFile } = require('./metadata');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ensureScaffoldTarget(targetDirectory) {
  if (!fs.existsSync(targetDirectory)) {
    fs.mkdirSync(targetDirectory, { recursive: true });
    return;
  }

  const entries = fs
    .readdirSync(targetDirectory)
    .filter((entry) => !['.git', '.DS_Store'].includes(entry));

  if (entries.length > 0) {
    throw new Error(`Target directory is not empty: ${targetDirectory}`);
  }
}

function customizeProject(targetDirectory, template, options) {
  const packageJsonPath = path.join(targetDirectory, 'package.json');
  const packageLockPath = path.join(targetDirectory, 'package-lock.json');
  const gitignorePath = path.join(targetDirectory, '.gitignore');

  if (fs.existsSync(packageJsonPath)) {
    fs.writeFileSync(
      packageJsonPath,
      renderTemplateFile(template, 'package.json', targetDirectory, options),
      'utf8'
    );
  }

  if (fs.existsSync(packageLockPath)) {
    fs.writeFileSync(
      packageLockPath,
      renderTemplateFile(
        template,
        'package-lock.json',
        targetDirectory,
        options
      ),
      'utf8'
    );
  }

  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, options.defaultGitignore, 'utf8');
  }
}

async function scaffoldProject(
  template,
  targetDirectory,
  prerequisites,
  options
) {
  const {
    createLocalCredentials,
    defaultGitignore,
    getTemplateDirectory,
    initializeGitRepository,
    renderProgress,
    toPackageName,
    writeGeneratedLocalEnv
  } = options;
  const templateDirectory = getTemplateDirectory(template.id);

  if (!fs.existsSync(templateDirectory)) {
    throw new Error(`Template files are missing for "${template.id}".`);
  }

  const steps = [
    'Validating target directory',
    'Copying template files',
    'Customizing project files',
    'Finalizing scaffold'
  ];

  renderProgress(0, steps.length, 'Preparing scaffold');
  ensureScaffoldTarget(targetDirectory);
  await sleep(60);

  renderProgress(1, steps.length, steps[0]);
  await sleep(80);

  fs.cpSync(templateDirectory, targetDirectory, { recursive: true });
  renderProgress(2, steps.length, steps[1]);
  await sleep(80);

  customizeProject(targetDirectory, template, {
    defaultGitignore,
    getTemplateDirectory,
    toPackageName
  });
  renderProgress(3, steps.length, steps[2]);
  await sleep(80);

  if (prerequisites.git) {
    initializeGitRepository(targetDirectory);
  }

  const localEnv = writeGeneratedLocalEnv(
    targetDirectory,
    template.id,
    createLocalCredentials(targetDirectory)
  );

  renderProgress(4, steps.length, steps[3]);
  await sleep(60);
  process.stdout.write('\n');
  return localEnv;
}

module.exports = {
  scaffoldProject
};
