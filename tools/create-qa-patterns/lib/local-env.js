const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

function createLocalCredentials(targetDirectory) {
  const projectSlug = path
    .basename(targetDirectory)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 12);
  const username = `${projectSlug || 'local'}-${crypto.randomBytes(3).toString('hex')}`;
  const password = `${crypto.randomBytes(9).toString('base64url')}A1!`;

  return {
    username,
    password
  };
}

function renderLocalEnv(templateId, credentials) {
  const common = [
    'TEST_ENV=dev',
    'TEST_RUN_ID=local',
    'DEV_UI_BASE_URL=http://127.0.0.1:3000'
  ];

  if (templateId === 'playwright-template') {
    common.push('DEV_API_BASE_URL=http://127.0.0.1:3001');
  }

  common.push(
    `DEV_APP_USERNAME=${credentials.username}`,
    `DEV_APP_PASSWORD=${credentials.password}`,
    `UI_DEMO_USERNAME=${credentials.username}`,
    `UI_DEMO_PASSWORD=${credentials.password}`
  );

  return `${common.join('\n')}\n`;
}

function writeGeneratedLocalEnv(targetDirectory, templateId, credentials) {
  const envPath = path.join(targetDirectory, '.env');

  if (fs.existsSync(envPath)) {
    return {
      created: false,
      envPath,
      credentials
    };
  }

  fs.writeFileSync(envPath, renderLocalEnv(templateId, credentials), 'utf8');
  return {
    created: true,
    envPath,
    credentials
  };
}

module.exports = {
  createLocalCredentials,
  renderLocalEnv,
  writeGeneratedLocalEnv
};
