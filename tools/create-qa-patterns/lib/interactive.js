const readline = require('node:readline');

function createLineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function askQuestion(prompt) {
  const lineInterface = createLineInterface();

  return new Promise((resolve) => {
    lineInterface.question(prompt, (answer) => {
      lineInterface.close();
      resolve(answer.trim());
    });
  });
}

async function askYesNo(prompt, defaultValue = true) {
  const suffix = defaultValue ? ' [Y/n] ' : ' [y/N] ';

  while (true) {
    const answer = (await askQuestion(`${prompt}${suffix}`)).toLowerCase();

    if (!answer) {
      return defaultValue;
    }

    if (['y', 'yes'].includes(answer)) {
      return true;
    }

    if (['n', 'no'].includes(answer)) {
      return false;
    }

    process.stdout.write('Please answer yes or no.\n');
  }
}

async function selectTemplateInteractively(templates) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    return null;
  }

  readline.emitKeypressEvents(process.stdin);

  if (typeof process.stdin.setRawMode === 'function') {
    process.stdin.setRawMode(true);
  }

  let selectedIndex = 0;
  let renderedLines = 0;

  const render = () => {
    if (renderedLines > 0) {
      readline.moveCursor(process.stdout, 0, -renderedLines);
      readline.clearScreenDown(process.stdout);
    }

    const lines = [
      'Select a template',
      'Use ↑/↓ to choose and press Enter to continue.',
      ''
    ];

    for (let index = 0; index < templates.length; index += 1) {
      const template = templates[index];
      const marker = index === selectedIndex ? '>' : ' ';
      lines.push(`${marker} ${template.label}`);
      lines.push(`  ${template.description}`);
      lines.push('');
    }

    renderedLines = lines.length;
    process.stdout.write(`${lines.join('\n')}\n`);
  };

  render();

  return new Promise((resolve) => {
    const handleKeypress = (_, key) => {
      if (!key) {
        return;
      }

      if (key.name === 'up') {
        selectedIndex =
          (selectedIndex - 1 + templates.length) % templates.length;
        render();
        return;
      }

      if (key.name === 'down') {
        selectedIndex = (selectedIndex + 1) % templates.length;
        render();
        return;
      }

      if (key.name === 'return') {
        process.stdin.off('keypress', handleKeypress);
        if (typeof process.stdin.setRawMode === 'function') {
          process.stdin.setRawMode(false);
        }
        readline.clearScreenDown(process.stdout);
        process.stdout.write(`Selected: ${templates[selectedIndex].label}\n\n`);
        resolve(templates[selectedIndex].id);
        return;
      }

      if (key.ctrl && key.name === 'c') {
        process.stdin.off('keypress', handleKeypress);
        if (typeof process.stdin.setRawMode === 'function') {
          process.stdin.setRawMode(false);
        }
        process.stdout.write('\n');
        process.exit(1);
      }
    };

    process.stdin.on('keypress', handleKeypress);
  });
}

module.exports = {
  askQuestion,
  askYesNo,
  selectTemplateInteractively
};
