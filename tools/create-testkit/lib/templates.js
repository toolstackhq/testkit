const fs = require('node:fs');
const path = require('node:path');

function createTemplateAliases(templates) {
  return new Map(
    templates.flatMap((template) => [
      [template.id, template.id],
      ...template.aliases.map((alias) => [alias, template.id])
    ])
  );
}

function resolveTemplate(templateAliases, value) {
  return templateAliases.get(value);
}

function getTemplate(templates, templateId) {
  return templates.find((template) => template.id === templateId);
}

function toPackageName(targetDirectory, template) {
  const baseName = path.basename(targetDirectory).toLowerCase();
  const normalized = baseName
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');

  return normalized || template.defaultPackageName || 'testkit-template';
}

function getTemplateDirectory(rootDirectory, templateId) {
  const bundledTemplateDirectory = path.resolve(
    rootDirectory,
    'templates',
    templateId
  );

  if (fs.existsSync(bundledTemplateDirectory)) {
    return bundledTemplateDirectory;
  }

  return path.resolve(rootDirectory, '..', '..', 'templates', templateId);
}

module.exports = {
  createTemplateAliases,
  getTemplate,
  getTemplateDirectory,
  resolveTemplate,
  toPackageName
};
