import "./styles.css";

document.querySelector("#app").innerHTML = `
  <div class="shell">
    <header class="hero">
      <div class="hero__copy">
        <p class="eyebrow">qa-patterns MCP server</p>
        <h1>Scaffold real QA frameworks without making the LLM rewrite boilerplate.</h1>
        <p class="lede">
          The MCP server exposes a tiny tool surface for <code>Playwright</code> and <code>Cypress</code> scaffolding,
          validation, and next steps. The LLM decides what to create. The scaffold does the boring, deterministic work.
        </p>
        <div class="hero__actions">
          <a href="#tools" class="button button--primary">See the tool contract</a>
          <a href="#setup" class="button button--ghost">Run it locally</a>
        </div>
      </div>
      <div class="hero__panel">
        <p class="panel__label">Prompt</p>
        <pre><code>Generate a Playwright framework with best practices and sample tests.</code></pre>
        <p class="panel__label">MCP flow</p>
        <ol>
          <li><code>describe_template("playwright-template")</code></li>
          <li><code>scaffold_template(...)</code></li>
          <li><code>get_next_steps(...)</code></li>
        </ol>
      </div>
    </header>

    <main>
      <section class="section grid grid--three">
        <article class="card">
          <h2>Deterministic</h2>
          <p>The server wraps the existing scaffold CLI, so every generated project follows the repo’s tested template.</p>
        </article>
        <article class="card">
          <h2>Token efficient</h2>
          <p>The model stops recreating framework files from scratch and spends its tokens on user-specific customization.</p>
        </article>
        <article class="card">
          <h2>Safe by default</h2>
          <p>The tool surface is intentionally small: list, describe, scaffold, validate, and next steps. No arbitrary shell.</p>
        </article>
      </section>

      <section id="tools" class="section">
        <div class="section__heading">
          <p class="eyebrow">Tool surface</p>
          <h2>Minimal MCP API</h2>
        </div>
        <div class="grid grid--two">
          <article class="tool-card">
            <h3><code>list_templates</code></h3>
            <p>Returns the templates the server can scaffold.</p>
          </article>
          <article class="tool-card">
            <h3><code>describe_template</code></h3>
            <p>Returns the template description, main commands, and intended use.</p>
          </article>
          <article class="tool-card">
            <h3><code>scaffold_template</code></h3>
            <p>Creates a project by calling the existing scaffold CLI with deterministic flags.</p>
          </article>
          <article class="tool-card">
            <h3><code>validate_project</code></h3>
            <p>Runs the generated project’s real validation commands so the LLM can check what it created.</p>
          </article>
          <article class="tool-card">
            <h3><code>get_next_steps</code></h3>
            <p>Returns the exact shell commands a user should run next.</p>
          </article>
        </div>
      </section>

      <section class="section">
        <div class="section__heading">
          <p class="eyebrow">Templates</p>
          <h2>What the server can scaffold</h2>
        </div>
        <div class="grid grid--two">
          <article class="feature-card">
            <h3><code>playwright-template</code></h3>
            <ul>
              <li><code>TypeScript</code> test framework with fixtures and page objects</li>
              <li>Deterministic UI and API demo apps</li>
              <li><code>Docker</code>, CI, HTML reporting, and optional <code>Allure</code></li>
            </ul>
          </article>
          <article class="feature-card">
            <h3><code>cypress-template</code></h3>
            <ul>
              <li><code>TypeScript</code> specs with custom commands and page modules</li>
              <li>Deterministic UI demo app</li>
              <li>CI, screenshots/videos, and optional <code>Allure</code></li>
            </ul>
          </article>
        </div>
      </section>

      <section id="setup" class="section">
        <div class="section__heading">
          <p class="eyebrow">Local setup</p>
          <h2>Run the MCP server</h2>
        </div>
        <div class="code-grid">
          <div class="code-block">
            <p class="panel__label">Install dependencies</p>
            <pre><code>npm install</code></pre>
          </div>
          <div class="code-block">
            <p class="panel__label">Start the server</p>
            <pre><code>npm run mcp:start</code></pre>
          </div>
        </div>
        <p class="note">
          The server uses stdio transport, which is what most MCP-aware local clients expect.
        </p>
      </section>

      <section class="section">
        <div class="section__heading">
          <p class="eyebrow">Design choice</p>
          <h2>Why not let the model generate everything?</h2>
        </div>
        <div class="grid grid--two">
          <article class="card card--contrast">
            <h3>Prompt-only generation</h3>
            <p>High token use, drift across providers, broken file trees, and inconsistent framework quality.</p>
          </article>
          <article class="card card--contrast">
            <h3>MCP + scaffold</h3>
            <p>Stable file tree, deterministic framework rules, lower token spend, and easier template upgrades later.</p>
          </article>
        </div>
      </section>
    </main>
  </div>
`;
