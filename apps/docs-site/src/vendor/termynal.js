/**
 * Minimal Termynal-style terminal animation for the docs site.
 * Inspired by https://github.com/ines/termynal (MIT).
 */
export default class Termynal {
  constructor(element, options = {}) {
    this.element = element;
    this.options = {
      startDelay: 500,
      typeDelay: 26,
      lineDelay: 560,
      progressDuration: 1300,
      ...options
    };
    this.steps = [...element.querySelectorAll('[data-ty]')].map((node) => ({
      type: node.dataset.ty || 'output',
      text: node.textContent || '',
      delay: Number(node.dataset.tyDelay || 0),
      prompt: node.dataset.tyPrompt || '$',
      progressLabel: node.dataset.tyProgressLabel || 'Scaffolding project'
    }));
    this.element.innerHTML = '';
    this.element.classList.add('termynal');
    this.output = document.createElement('div');
    this.output.className = 'termynal__viewport';
    this.element.appendChild(this.output);
  }

  async start() {
    await this.wait(this.options.startDelay);
    for (const step of this.steps) {
      if (step.delay) {
        await this.wait(step.delay);
      }
      if (step.type === 'input') {
        await this.renderInput(step);
      } else if (step.type === 'progress') {
        await this.renderProgress(step);
      } else {
        await this.renderOutput(step);
      }
    }
  }

  async renderInput(step) {
    const line = this.createLine('termynal__line termynal__line--input');
    const prompt = document.createElement('span');
    prompt.className = 'termynal__prompt';
    prompt.textContent = `${step.prompt} `;
    const body = document.createElement('span');
    body.className = 'termynal__body';
    line.append(prompt, body);
    this.output.appendChild(line);

    for (const character of step.text) {
      body.textContent += character;
      await this.wait(this.options.typeDelay);
    }

    await this.wait(this.options.lineDelay);
  }

  async renderOutput(step) {
    const line = this.createLine('termynal__line');
    line.textContent = step.text;
    this.output.appendChild(line);
    await this.wait(this.options.lineDelay);
  }

  async renderProgress(step) {
    const line = this.createLine('termynal__line termynal__line--progress');
    const label = document.createElement('span');
    label.textContent = step.progressLabel;
    const bar = document.createElement('span');
    bar.className = 'termynal__progress';
    const fill = document.createElement('span');
    fill.className = 'termynal__progress-fill';
    bar.appendChild(fill);
    line.append(label, bar);
    this.output.appendChild(line);
    await this.wait(this.options.progressDuration);
  }

  createLine(className) {
    const line = document.createElement('div');
    line.className = className;
    return line;
  }

  wait(duration) {
    return new Promise((resolve) => {
      globalThis.setTimeout(resolve, duration);
    });
  }
}
