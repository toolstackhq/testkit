const { spawn } = require('node:child_process');
const http = require('node:http');

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function openBrowser(url) {
  const platform = process.platform;

  try {
    if (platform === 'darwin') {
      spawn('open', [url], {
        detached: true,
        stdio: 'ignore'
      }).unref();
      return true;
    }

    if (platform === 'win32') {
      spawn('cmd', ['/c', 'start', '', url], {
        detached: true,
        stdio: 'ignore'
      }).unref();
      return true;
    }

    spawn('xdg-open', [url], {
      detached: true,
      stdio: 'ignore'
    }).unref();
    return true;
  } catch {
    return false;
  }
}

function normalizeBrowserLogChunk(chunk) {
  return chunk.replaceAll('\r', '\n');
}

function createHtml({ packageName, templates, defaultTemplateId }) {
  const serializedTemplates = JSON.stringify(templates);
  const escapedPackageName = escapeHtml(packageName);
  const escapedDefaultTemplateId = escapeHtml(defaultTemplateId);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapedPackageName} setup</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f5f7fb;
        --panel: rgba(255, 255, 255, 0.92);
        --panel-strong: #ffffff;
        --border: rgba(15, 23, 42, 0.08);
        --border-strong: rgba(15, 23, 42, 0.16);
        --text: #0f172a;
        --muted: #475569;
        --subtle: #64748b;
        --accent: #2563eb;
        --accent-soft: rgba(37, 99, 235, 0.08);
        --success: #0f766e;
        --warning: #b45309;
        --danger: #b91c1c;
        --shadow: 0 24px 64px rgba(15, 23, 42, 0.08);
        --radius: 22px;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        font-family: "Segoe UI", Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        background:
          radial-gradient(circle at top left, rgba(37, 99, 235, 0.08), transparent 28%),
          linear-gradient(180deg, #f8fbff 0%, var(--bg) 100%);
        color: var(--text);
      }

      .shell {
        min-height: 100vh;
        padding: 40px 24px 56px;
      }

      .frame {
        max-width: 1220px;
        margin: 0 auto;
      }

      .hero {
        display: grid;
        grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
        gap: 24px;
        align-items: start;
      }

      .hero-card,
      .panel {
        background: var(--panel);
        backdrop-filter: blur(14px);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
      }

      .hero-card {
        padding: 32px;
      }

      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 8px 12px;
        border-radius: 999px;
        background: var(--accent-soft);
        color: var(--accent);
        font-size: 0.84rem;
        font-weight: 700;
        letter-spacing: 0.02em;
      }

      h1 {
        margin: 18px 0 12px;
        font-size: clamp(2.1rem, 4vw, 3.3rem);
        line-height: 1.05;
        letter-spacing: -0.04em;
      }

      .lede {
        margin: 0;
        max-width: 50rem;
        color: var(--muted);
        font-size: 1.02rem;
        line-height: 1.7;
      }

      .hero-points {
        margin: 24px 0 0;
        padding: 0;
        list-style: none;
        display: grid;
        gap: 14px;
      }

      .hero-points li {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        color: var(--muted);
        line-height: 1.6;
      }

      .hero-points strong {
        color: var(--text);
      }

      .bullet {
        display: inline-grid;
        place-items: center;
        width: 22px;
        height: 22px;
        border-radius: 999px;
        background: var(--accent-soft);
        color: var(--accent);
        font-size: 0.9rem;
        font-weight: 700;
        flex: 0 0 auto;
        margin-top: 1px;
      }

      .hero-side {
        padding: 28px;
      }

      .hero-side h2 {
        margin: 0 0 8px;
        font-size: 1.15rem;
      }

      .hero-side p {
        margin: 0;
        color: var(--muted);
        line-height: 1.6;
      }

      .status-banner {
        margin-top: 20px;
        padding: 16px 18px;
        border-radius: 18px;
        background: #0f172a;
        color: #e2e8f0;
        font-size: 0.95rem;
        line-height: 1.6;
      }

      .status-banner strong {
        color: #ffffff;
      }

      .layout {
        margin-top: 24px;
        display: grid;
        grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
        gap: 24px;
      }

      .panel {
        padding: 28px;
      }

      .panel h2 {
        margin: 0 0 8px;
        font-size: 1.18rem;
        letter-spacing: -0.02em;
      }

      .panel > p {
        margin: 0 0 22px;
        color: var(--muted);
        line-height: 1.65;
      }

      .field-stack {
        display: grid;
        gap: 22px;
      }

      .field label,
      .field legend {
        display: block;
        margin: 0 0 10px;
        font-size: 0.93rem;
        font-weight: 700;
      }

      .field legend {
        padding: 0;
      }

      fieldset {
        margin: 0;
        padding: 0;
        border: 0;
      }

      .template-grid {
        display: grid;
        gap: 12px;
      }

      .template-card {
        position: relative;
        display: block;
        width: 100%;
        text-align: left;
        padding: 18px 18px 16px;
        border-radius: 18px;
        border: 1px solid var(--border);
        background: var(--panel-strong);
        cursor: pointer;
        transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
      }

      .template-card:hover {
        transform: translateY(-1px);
        border-color: rgba(37, 99, 235, 0.18);
        box-shadow: 0 10px 22px rgba(37, 99, 235, 0.08);
      }

      .template-card.is-active {
        border-color: rgba(37, 99, 235, 0.34);
        box-shadow: 0 12px 24px rgba(37, 99, 235, 0.12);
        background: linear-gradient(180deg, rgba(37, 99, 235, 0.08), rgba(255, 255, 255, 0.98));
      }

      .template-card strong {
        display: block;
        font-size: 1rem;
        letter-spacing: -0.02em;
      }

      .template-card span {
        display: block;
        margin-top: 6px;
        color: var(--muted);
        line-height: 1.55;
        font-size: 0.92rem;
      }

      .template-card .badge {
        position: absolute;
        top: 16px;
        right: 16px;
        padding: 5px 9px;
        border-radius: 999px;
        background: rgba(37, 99, 235, 0.12);
        color: var(--accent);
        font-size: 0.74rem;
        font-weight: 700;
      }

      .text-input {
        width: 100%;
        padding: 14px 16px;
        border-radius: 14px;
        border: 1px solid var(--border-strong);
        background: #fff;
        color: var(--text);
        font: inherit;
      }

      .text-input:focus {
        outline: 2px solid rgba(37, 99, 235, 0.16);
        border-color: rgba(37, 99, 235, 0.4);
      }

      .toggle-list {
        display: grid;
        gap: 12px;
      }

      .toggle {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 14px;
        align-items: start;
        padding: 14px 16px;
        border-radius: 16px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.82);
      }

      .toggle input {
        margin-top: 3px;
      }

      .toggle strong {
        display: block;
        margin-bottom: 4px;
        font-size: 0.95rem;
      }

      .toggle span {
        color: var(--muted);
        font-size: 0.9rem;
        line-height: 1.55;
      }

      .toggle.is-disabled {
        opacity: 0.58;
      }

      .actions {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .button {
        appearance: none;
        border: 0;
        border-radius: 14px;
        padding: 13px 18px;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
      }

      .button:hover {
        transform: translateY(-1px);
      }

      .button:disabled {
        cursor: not-allowed;
        transform: none;
        opacity: 0.68;
      }

      .button-primary {
        background: linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%);
        color: #ffffff;
        box-shadow: 0 14px 30px rgba(37, 99, 235, 0.22);
      }

      .button-secondary {
        background: rgba(15, 23, 42, 0.06);
        color: var(--text);
      }

      .hint {
        color: var(--subtle);
        font-size: 0.88rem;
      }

      .preview-card {
        border-radius: 18px;
        border: 1px solid var(--border);
        background: rgba(15, 23, 42, 0.96);
        overflow: hidden;
      }

      .preview-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 14px 16px;
        border-bottom: 1px solid rgba(226, 232, 240, 0.08);
      }

      .preview-header strong {
        color: #f8fafc;
        font-size: 0.92rem;
      }

      .preview-header span {
        color: #94a3b8;
        font-size: 0.8rem;
      }

      .code-block {
        margin: 0;
        padding: 18px 18px 20px;
        color: #cbd5e1;
        font-family: "SFMono-Regular", ui-monospace, Menlo, Consolas, monospace;
        font-size: 0.89rem;
        line-height: 1.8;
        overflow-x: auto;
        white-space: pre-wrap;
      }

      .log-block {
        min-height: 360px;
        max-height: 520px;
      }

      .log-empty {
        color: #64748b;
      }

      .log-stream {
        color: #e2e8f0;
      }

      .meta-grid {
        margin-top: 18px;
        display: grid;
        gap: 12px;
      }

      .meta-card {
        padding: 14px 16px;
        border-radius: 16px;
        border: 1px solid var(--border);
        background: rgba(255, 255, 255, 0.82);
      }

      .meta-card strong {
        display: block;
        margin-bottom: 6px;
        font-size: 0.9rem;
      }

      .meta-card span {
        color: var(--muted);
        line-height: 1.55;
        font-size: 0.9rem;
      }

      .run-state {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border-radius: 999px;
        background: rgba(15, 23, 42, 0.06);
        color: var(--text);
        font-size: 0.84rem;
        font-weight: 700;
      }

      .run-state::before {
        content: "";
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: var(--subtle);
      }

      .run-state[data-state="running"]::before {
        background: var(--accent);
      }

      .run-state[data-state="completed"]::before {
        background: var(--success);
      }

      .run-state[data-state="failed"]::before {
        background: var(--danger);
      }

      @media (max-width: 980px) {
        .hero,
        .layout {
          grid-template-columns: 1fr;
        }

        .shell {
          padding: 24px 16px 40px;
        }

        .hero-card,
        .hero-side,
        .panel {
          padding: 22px;
        }
      }
    </style>
  </head>
  <body>
    <div class="shell">
      <div class="frame">
        <section class="hero">
          <div class="hero-card">
            <div class="eyebrow">Local setup UI</div>
            <h1>Configure a test framework without leaving the terminal flow.</h1>
            <p class="lede">
              This browser page is a professional wrapper around the same deterministic
              <code>${escapedPackageName}</code> scaffold engine. Choose your template and
              post-generate actions here, then watch the live output mirror in both the UI and your
              terminal.
            </p>
            <ul class="hero-points">
              <li><span class="bullet">1</span><span><strong>One engine.</strong> The UI calls the same scaffold path as the CLI.</span></li>
              <li><span class="bullet">2</span><span><strong>Terminal remains primary.</strong> Logs continue in the shell that started the process.</span></li>
              <li><span class="bullet">3</span><span><strong>Live mirror.</strong> This page shows the same setup activity so users can track progress visually.</span></li>
            </ul>
          </div>
          <aside class="hero-card hero-side">
            <h2>How to use this page</h2>
            <p>
              Pick a framework, choose whether to include API coverage and post-generate steps,
              then start scaffolding. When the run begins, keep an eye on your terminal for the
              full source-of-truth output. This page is designed as a clean mirror, not a separate
              execution path.
            </p>
            <div class="status-banner">
              <strong>After you submit:</strong> return to the terminal you launched
              <code>${escapedPackageName} --ui</code> from. The browser will stay in sync, but the
              terminal remains the best place to watch installs, setup steps, and recovery output.
            </div>
          </aside>
        </section>

        <section class="layout">
          <section class="panel">
            <h2>Configuration</h2>
            <p>Choose the framework and the exact actions the scaffold should perform.</p>
            <form id="scaffold-form" class="field-stack">
              <fieldset class="field">
                <legend>Framework</legend>
                <div id="template-grid" class="template-grid"></div>
              </fieldset>

              <div class="field">
                <label for="targetDirectory">Target directory</label>
                <input id="targetDirectory" class="text-input" name="targetDirectory" value="my-testkit-project" spellcheck="false" />
              </div>

              <fieldset class="field">
                <legend>Options</legend>
                <div class="toggle-list">
                  <label class="toggle">
                    <input id="withApi" name="withApi" type="checkbox" checked />
                    <span>
                      <strong>Include API tests</strong>
                      Keep the bundled API client, example API checks, and demo API server.
                    </span>
                  </label>
                  <label class="toggle">
                    <input id="runInstall" name="runInstall" type="checkbox" checked />
                    <span>
                      <strong>Run npm install</strong>
                      Install dependencies immediately after the scaffold completes.
                    </span>
                  </label>
                  <label class="toggle" id="setupToggle">
                    <input id="runSetup" name="runSetup" type="checkbox" checked />
                    <span>
                      <strong id="setupTitle">Run Playwright setup</strong>
                      <span id="setupDescription">Install Playwright browsers after npm install.</span>
                    </span>
                  </label>
                  <label class="toggle">
                    <input id="runTests" name="runTests" type="checkbox" />
                    <span>
                      <strong>Run npm test</strong>
                      Execute the starter validation path once the project is ready.
                    </span>
                  </label>
                </div>
              </fieldset>

              <div class="actions">
                <button id="startButton" class="button button-primary" type="submit">Start scaffolding</button>
                <button id="resetButton" class="button button-secondary" type="button">Reset defaults</button>
              </div>
              <div class="hint">Execution starts in the same terminal session that launched this local UI.</div>
            </form>
          </section>

          <section class="panel">
            <h2>Live activity</h2>
            <p>Preview the exact command shape, then follow the mirrored output while the scaffold runs.</p>
            <div class="actions" style="margin-bottom: 18px;">
              <div id="runState" class="run-state" data-state="idle">Idle</div>
            </div>

            <div class="preview-card" style="margin-bottom: 18px;">
              <div class="preview-header">
                <strong>Command preview</strong>
                <span>UI wrapper over the CLI</span>
              </div>
              <pre id="commandPreview" class="code-block"></pre>
            </div>

            <div class="preview-card">
              <div class="preview-header">
                <strong>Activity stream</strong>
                <span>Mirrored from the active terminal run</span>
              </div>
              <pre id="activityLog" class="code-block log-block"><span class="log-empty">No scaffold activity yet. Start a run to stream output here.</span></pre>
            </div>

            <div class="meta-grid">
              <div class="meta-card">
                <strong>Terminal guidance</strong>
                <span>When the run starts, head back to the terminal for full control. This browser stays in sync but does not replace the CLI.</span>
              </div>
              <div class="meta-card">
                <strong>Determinism</strong>
                <span>The browser form submits to the same scaffold engine, template logic, and post-generate actions used by <code>${escapedPackageName}</code>.</span>
              </div>
            </div>
          </section>
        </section>
      </div>
    </div>

    <script>
      const templates = ${serializedTemplates};
      const defaultTemplateId = ${JSON.stringify(defaultTemplateId)};
      const state = {
        templateId: defaultTemplateId,
        busy: false,
        logs: ''
      };

      const templateGrid = document.getElementById('template-grid');
      const targetDirectory = document.getElementById('targetDirectory');
      const withApi = document.getElementById('withApi');
      const runInstall = document.getElementById('runInstall');
      const runSetup = document.getElementById('runSetup');
      const runTests = document.getElementById('runTests');
      const setupToggle = document.getElementById('setupToggle');
      const setupTitle = document.getElementById('setupTitle');
      const setupDescription = document.getElementById('setupDescription');
      const runState = document.getElementById('runState');
      const startButton = document.getElementById('startButton');
      const resetButton = document.getElementById('resetButton');
      const commandPreview = document.getElementById('commandPreview');
      const activityLog = document.getElementById('activityLog');
      const form = document.getElementById('scaffold-form');

      function findTemplate(templateId) {
        return templates.find((template) => template.id === templateId) || templates[0];
      }

      function updateSetupControl() {
        const template = findTemplate(state.templateId);
        const isPlaywright = template.id === 'playwright-template';
        runSetup.disabled = !isPlaywright;
        setupToggle.classList.toggle('is-disabled', !isPlaywright);

        if (isPlaywright) {
          setupTitle.textContent = 'Run Playwright setup';
          setupDescription.textContent = 'Install Playwright browsers after npm install.';
          runSetup.checked = true;
        } else {
          setupTitle.textContent = 'Template-specific setup';
          setupDescription.textContent = 'No extra setup step is required for this template.';
          runSetup.checked = false;
        }
      }

      function renderTemplates() {
        templateGrid.innerHTML = '';
        for (const template of templates) {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'template-card' + (template.id === state.templateId ? ' is-active' : '');
          button.dataset.templateId = template.id;
          button.innerHTML = '<strong>' + template.label + '</strong>' +
            '<span>' + template.description + '</span>' +
            (template.id === defaultTemplateId ? '<span class="badge">Default</span>' : '');
          button.addEventListener('click', () => {
            if (state.busy) return;
            state.templateId = template.id;
            updateSetupControl();
            renderTemplates();
            renderCommandPreview();
          });
          templateGrid.appendChild(button);
        }
      }

      function renderCommandPreview() {
        const target = (targetDirectory.value || '.').trim();
        const parts = ['npx', '@toolstackhq/create-testkit', state.templateId];
        if (target && target !== '.') {
          parts.push(target);
        }
        if (!withApi.checked) {
          parts.push('--no-api');
        }
        if (!runInstall.checked) {
          parts.push('--no-install');
        }
        if (runSetup.disabled || !runSetup.checked) {
          parts.push('--no-setup');
        }
        if (!runTests.checked) {
          parts.push('--no-test');
        }
        commandPreview.textContent = parts.join(' ');
      }

      function setRunState(nextState, label) {
        runState.dataset.state = nextState;
        runState.textContent = label;
      }

      function appendLog(text) {
        state.logs += text;
        if (!state.logs.trim()) {
          activityLog.innerHTML = '<span class="log-empty">No scaffold activity yet. Start a run to stream output here.</span>';
        } else {
          activityLog.innerHTML = '<span class="log-stream"></span>';
          activityLog.firstChild.textContent = state.logs;
          activityLog.scrollTop = activityLog.scrollHeight;
        }
      }

      function resetForm() {
        if (state.busy) return;
        state.templateId = defaultTemplateId;
        targetDirectory.value = 'my-testkit-project';
        withApi.checked = true;
        runInstall.checked = true;
        runTests.checked = false;
        updateSetupControl();
        renderTemplates();
        renderCommandPreview();
      }

      targetDirectory.addEventListener('input', renderCommandPreview);
      withApi.addEventListener('change', renderCommandPreview);
      runInstall.addEventListener('change', renderCommandPreview);
      runSetup.addEventListener('change', renderCommandPreview);
      runTests.addEventListener('change', renderCommandPreview);
      resetButton.addEventListener('click', resetForm);

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (state.busy) return;

        state.busy = true;
        state.logs = '';
        appendLog('');
        setRunState('running', 'Running');
        startButton.disabled = true;
        resetButton.disabled = true;

        const payload = {
          templateName: state.templateId,
          targetDirectory: targetDirectory.value.trim() || '.',
          withApi: withApi.checked,
          runInstall: runInstall.checked,
          runSetup: runSetup.disabled ? false : runSetup.checked,
          runTest: runTests.checked
        };

        const response = await fetch('/api/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const result = await response.json().catch(() => ({ error: 'Unable to start scaffold.' }));
          state.busy = false;
          setRunState('failed', 'Failed to start');
          appendLog((result.error || 'Unable to start scaffold.') + '\\n');
          startButton.disabled = false;
          resetButton.disabled = false;
        }
      });

      const eventSource = new EventSource('/events');
      eventSource.addEventListener('snapshot', (event) => {
        const payload = JSON.parse(event.data);
        state.logs = payload.logs || '';
        appendLog('');
        state.busy = payload.busy;
        setRunState(payload.state || 'idle', payload.label || 'Idle');
        startButton.disabled = payload.busy;
        resetButton.disabled = payload.busy;
      });
      eventSource.addEventListener('log', (event) => {
        const payload = JSON.parse(event.data);
        appendLog(payload.text || '');
      });
      eventSource.addEventListener('state', (event) => {
        const payload = JSON.parse(event.data);
        state.busy = Boolean(payload.busy);
        setRunState(payload.state || 'idle', payload.label || 'Idle');
        startButton.disabled = state.busy;
        resetButton.disabled = state.busy;
      });

      updateSetupControl();
      renderTemplates();
      renderCommandPreview();
    </script>
  </body>
</html>`;
}

function startUiServer(options) {
  const {
    colors,
    defaultTemplateId,
    packageName,
    port,
    runScaffold,
    templates
  } = options;
  const clients = new Set();
  const state = {
    busy: false,
    logs: '',
    runState: 'idle',
    runLabel: 'Idle'
  };

  function broadcast(event, payload) {
    const serialized = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const response of clients) {
      response.write(serialized);
    }
  }

  function appendLog(text) {
    state.logs += text;
    broadcast('log', { text });
  }

  function setState(nextState, label, busy) {
    state.runState = nextState;
    state.runLabel = label;
    state.busy = busy;
    broadcast('state', {
      state: nextState,
      label,
      busy
    });
  }

  function mirrorProcessOutput() {
    const stdoutWrite = process.stdout.write.bind(process.stdout);
    const stderrWrite = process.stderr.write.bind(process.stderr);

    process.stdout.write = (chunk, encoding, callback) => {
      const text = Buffer.isBuffer(chunk)
        ? chunk.toString(encoding || 'utf8')
        : chunk;
      appendLog(normalizeBrowserLogChunk(String(text)));
      return stdoutWrite(chunk, encoding, callback);
    };

    process.stderr.write = (chunk, encoding, callback) => {
      const text = Buffer.isBuffer(chunk)
        ? chunk.toString(encoding || 'utf8')
        : chunk;
      appendLog(normalizeBrowserLogChunk(String(text)));
      return stderrWrite(chunk, encoding, callback);
    };

    return () => {
      process.stdout.write = stdoutWrite;
      process.stderr.write = stderrWrite;
    };
  }

  async function handleRun(selection) {
    if (state.busy) {
      throw new Error('A scaffold run is already in progress.');
    }

    state.logs = '';
    setState('running', 'Running', true);
    const restoreOutput = mirrorProcessOutput();
    process.env.TESTKIT_UI_MIRROR = '1';

    try {
      await runScaffold(selection);
      setState('completed', 'Completed', false);
      appendLog(
        '\nUI session complete. Head back to the terminal for follow-up commands or additional runs.\n'
      );
    } catch (error) {
      setState('failed', 'Failed', false);
      const message = error instanceof Error ? error.message : String(error);
      appendLog(`\n${message}\n`);
    } finally {
      delete process.env.TESTKIT_UI_MIRROR;
      restoreOutput();
    }
  }

  const server = http.createServer((request, response) => {
    const { method = 'GET', url = '/' } = request;

    if (method === 'GET' && url === '/') {
      response.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8'
      });
      response.end(
        createHtml({
          defaultTemplateId,
          packageName,
          templates
        })
      );
      return;
    }

    if (method === 'GET' && url === '/events') {
      response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive'
      });
      response.write(
        `event: snapshot\ndata: ${JSON.stringify({
          busy: state.busy,
          state: state.runState,
          label: state.runLabel,
          logs: state.logs
        })}\n\n`
      );
      clients.add(response);
      request.on('close', () => {
        clients.delete(response);
      });
      return;
    }

    if (method === 'POST' && url === '/api/start') {
      let body = '';
      request.on('data', (chunk) => {
        body += chunk;
      });
      request.on('end', async () => {
        try {
          const payload = JSON.parse(body || '{}');
          response.writeHead(202, {
            'Content-Type': 'application/json; charset=utf-8'
          });
          response.end(JSON.stringify({ accepted: true }));
          await handleRun(payload);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          if (!response.headersSent) {
            response.writeHead(400, {
              'Content-Type': 'application/json; charset=utf-8'
            });
            response.end(JSON.stringify({ error: message }));
          } else {
            appendLog(`\n${message}\n`);
            setState('failed', 'Failed', false);
          }
        }
      });
      return;
    }

    response.writeHead(404, {
      'Content-Type': 'text/plain; charset=utf-8'
    });
    response.end('Not found');
  });

  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(port, '127.0.0.1', () => {
      const url = `http://127.0.0.1:${port}`;
      const opened = openBrowser(url);
      process.stdout.write(
        `${colors.bold('Local setup UI')}\n` +
          `  URL: ${url}\n` +
          `  Execution stays in this terminal. The browser mirrors progress and helps collect selections.\n` +
          `  Browser launch: ${opened ? 'opened automatically' : 'open the URL manually'}\n\n`
      );
      resolve({ server, url });
    });
  });
}

module.exports = {
  startUiServer
};
