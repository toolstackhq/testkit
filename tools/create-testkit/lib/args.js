const path = require('node:path');

function parseCliOptions(args, { resolveTemplate, supportedTemplateIds }) {
  const options = {
    yes: false,
    ui: false,
    port: 4310,
    noInstall: false,
    noSetup: false,
    noTest: false,
    safe: false,
    withApi: null,
    templateName: null,
    positionalArgs: []
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    switch (arg) {
      case '--yes':
        options.yes = true;
        break;
      case '--ui':
        options.ui = true;
        break;
      case '--port': {
        const portValue = args[index + 1];
        if (!portValue) {
          throw new Error('Missing value for --port.');
        }

        const parsedPort = Number.parseInt(portValue, 10);
        if (Number.isNaN(parsedPort) || parsedPort < 1 || parsedPort > 65_535) {
          throw new Error(`Invalid port "${portValue}".`);
        }

        options.port = parsedPort;
        index += 1;
        break;
      }
      case '--no-install':
        options.noInstall = true;
        break;
      case '--no-setup':
        options.noSetup = true;
        break;
      case '--no-test':
        options.noTest = true;
        break;
      case '--safe':
        options.safe = true;
        break;
      case '--with-api':
        options.withApi = true;
        break;
      case '--no-api':
        options.withApi = false;
        break;
      case '--template': {
        const templateValue = args[index + 1];
        if (!templateValue) {
          throw new Error('Missing value for --template.');
        }

        const templateName = resolveTemplate(templateValue);
        if (!templateName) {
          throw new Error(
            `Unsupported template "${templateValue}". Supported templates: ${supportedTemplateIds.join(', ')}.`
          );
        }

        options.templateName = templateName;
        index += 1;
        break;
      }
      default:
        options.positionalArgs.push(arg);
        break;
    }
  }

  return options;
}

function resolveNonInteractiveArgs(args, options) {
  const {
    templateName,
    resolveTemplate,
    supportedTemplateIds,
    defaultTemplate
  } = options;

  if (templateName) {
    if (args.length > 1) {
      throw new Error(
        'Too many arguments. Run `create-testkit --help` for usage.'
      );
    }

    if (args.length === 0) {
      return {
        templateName,
        targetDirectory: process.cwd(),
        generatedInCurrentDirectory: true
      };
    }

    return {
      templateName,
      targetDirectory: path.resolve(process.cwd(), args[0]),
      generatedInCurrentDirectory: false
    };
  }

  if (args.length === 0) {
    return {
      templateName: defaultTemplate,
      targetDirectory: process.cwd(),
      generatedInCurrentDirectory: true
    };
  }

  if (args.length === 1) {
    const explicitTemplate = resolveTemplate(args[0]);

    if (explicitTemplate) {
      return {
        templateName: explicitTemplate,
        targetDirectory: process.cwd(),
        generatedInCurrentDirectory: true
      };
    }

    return {
      templateName: defaultTemplate,
      targetDirectory: path.resolve(process.cwd(), args[0]),
      generatedInCurrentDirectory: false
    };
  }

  if (args.length === 2) {
    const explicitTemplate = resolveTemplate(args[0]);

    if (!explicitTemplate) {
      throw new Error(
        `Unsupported template "${args[0]}". Supported templates: ${supportedTemplateIds.join(', ')}.`
      );
    }

    return {
      templateName: explicitTemplate,
      targetDirectory: path.resolve(process.cwd(), args[1]),
      generatedInCurrentDirectory: false
    };
  }

  throw new Error('Too many arguments. Run `create-testkit --help` for usage.');
}

module.exports = {
  parseCliOptions,
  resolveNonInteractiveArgs
};
