# Adoption Improvement Plan: qa-patterns

**Author**: Senior Engineer Review
**Date**: 2026-03-17
**Status**: Draft — pending review

---

## Table of Contents

1. [Extract shared config into a package](#1-extract-shared-config-into-a-package)
2. [Add Prettier](#2-add-prettier)
3. [Modularize and test the CLI](#3-modularize-and-test-the-cli)
4. [Build an upgrade mechanism](#4-build-an-upgrade-mechanism)
5. [Remove hardcoded credentials](#5-remove-hardcoded-credentials)
6. [Validate scaffolded project CI end-to-end](#6-validate-scaffolded-project-ci-end-to-end)

---

## 1. Extract shared config into a package

### Problem

The Playwright and Cypress templates duplicate ~15-20% of their code. Identical logic exists in both templates for config loading, data factories, ID generation, seeded faker, and secret management. When a bug is found or an improvement is made, it must be applied in two places — and the two copies have already drifted apart (different method names, different hash algorithms, missing methods).

### Evidence of drift

| File | Playwright | Cypress | Drift |
|------|-----------|---------|-------|
| `secret-manager.ts` | Interface method: `getSecret()`, has `getRequiredSecret()` + `getOptionalSecret()` | Interface method: `getOptionalSecret()`, no `getRequiredSecret()` | Method names and capabilities diverged |
| `environments.ts` | Constant: `DEFAULTS`, param: `testEnv`, staging password: `"replace-me"` | Constant: `environmentDefaults`, param: `environment`, staging password: `"staging-password"` | Naming and sentinel values diverged |
| `seeded-faker.ts` | Hash: bitwise `((seed << 5) - seed + char) \| 0` | Hash: simple `accumulator + charCode` | **Different hash algorithms = different seeded data** |
| `id-generator.ts` | Has `nextSequence()` method | Missing `nextSequence()` entirely | Feature gap |
| `runtime-config.ts` | Has `apiBaseUrl` field | Missing `apiBaseUrl` | Intentional, but the 90% overlap is duplicated |

### Shared code (candidates for extraction)

```
config/
  runtime-config.ts   — 70% shared (schema loading, env cascade, secret resolution)
  environments.ts     — 80% shared (type, defaults map, getter)
  secret-manager.ts   — 85% shared (interface, EnvSecretProvider, SecretManager)
  test-env.ts         — 60% shared (environment validation)

data/
  factories/data-factory.ts   — 100% identical (only import paths differ)
  generators/id-generator.ts  — 90% shared (constructor, next())
  generators/seeded-faker.ts  — 80% shared (seeding, faker export)
```

### Plan

**Phase 1: Create `packages/qa-patterns-core/`**

Add a new workspace package to the monorepo:

```
packages/
  qa-patterns-core/
    src/
      config/
        runtime-config-base.ts   ← shared schema builder + loader
        environments.ts          ← shared type + defaults factory
        secret-manager.ts        ← unified interface + providers
        test-env.ts              ← shared validation
      data/
        data-factory.ts          ← shared factory
        id-generator.ts          ← shared generator (with nextSequence)
        seeded-faker.ts          ← shared seeded faker (one hash algorithm)
    package.json
    tsconfig.json
```

**Phase 2: Templates consume the shared package**

Each template imports from `@toolstackhq/qa-patterns-core` and extends only what's framework-specific.

**Phase 3: CLI bundles the core package into scaffolded output**

The scaffolding tool resolves `@toolstackhq/qa-patterns-core` at generation time and copies it into the output, so scaffolded projects remain standalone with no runtime dependency on the monorepo.

### Before

**`templates/playwright-template/config/secret-manager.ts`** (29 lines):
```ts
import type { TestEnvironment } from "./test-env";

export interface SecretProvider {
  getSecret(key: string, testEnv: TestEnvironment): string | undefined;
}

export class EnvSecretProvider implements SecretProvider {
  getSecret(key: string, testEnv: TestEnvironment): string | undefined {
    const envPrefix = testEnv.toUpperCase();
    return process.env[`${envPrefix}_${key}`] ?? process.env[key];
  }
}

export class SecretManager {
  constructor(private readonly provider: SecretProvider) {}

  getRequiredSecret(key: string, testEnv: TestEnvironment): string {
    const value = this.provider.getSecret(key, testEnv);
    if (!value) {
      throw new Error(`Missing secret "${key}" for TEST_ENV=${testEnv}`);
    }
    return value;
  }

  getOptionalSecret(key: string, testEnv: TestEnvironment): string | undefined {
    return this.provider.getSecret(key, testEnv);
  }
}
```

**`templates/cypress-template/config/secret-manager.ts`** (20 lines — drifted):
```ts
import type { TestEnvironment } from "./test-env";

export interface SecretProvider {
  getOptionalSecret(secretName: string, environment: TestEnvironment): string | undefined;
}

export class EnvSecretProvider implements SecretProvider {
  getOptionalSecret(secretName: string, environment: TestEnvironment): string | undefined {
    return process.env[`${environment.toUpperCase()}_${secretName}`] ?? process.env[secretName];
  }
}

export class SecretManager {
  constructor(private readonly secretProvider: SecretProvider) {}

  getOptionalSecret(secretName: string, environment: TestEnvironment): string | undefined {
    return this.secretProvider.getOptionalSecret(secretName, environment);
  }
}
```

### After

**`packages/qa-patterns-core/src/config/secret-manager.ts`** (single source of truth):
```ts
export type TestEnvironment = "dev" | "staging" | "prod";

export interface SecretProvider {
  getSecret(key: string, testEnv: TestEnvironment): string | undefined;
}

export class EnvSecretProvider implements SecretProvider {
  getSecret(key: string, testEnv: TestEnvironment): string | undefined {
    const envPrefix = testEnv.toUpperCase();
    return process.env[`${envPrefix}_${key}`] ?? process.env[key];
  }
}

export class SecretManager {
  constructor(private readonly provider: SecretProvider) {}

  getRequiredSecret(key: string, testEnv: TestEnvironment): string {
    const value = this.provider.getSecret(key, testEnv);
    if (!value) {
      throw new Error(`Missing secret "${key}" for TEST_ENV=${testEnv}`);
    }
    return value;
  }

  getOptionalSecret(key: string, testEnv: TestEnvironment): string | undefined {
    return this.provider.getSecret(key, testEnv);
  }
}
```

**`templates/playwright-template/config/secret-manager.ts`** (re-export only):
```ts
export { SecretProvider, EnvSecretProvider, SecretManager } from "@toolstackhq/qa-patterns-core/config/secret-manager";
```

### Effort estimate

Moderate. Requires careful extraction, updating all imports in both templates, and modifying the CLI to resolve/bundle the core package. The data layer (`DataFactory`, `IdGenerator`, `SeededFaker`) is straightforward. The config layer needs a builder/factory pattern to handle the `apiBaseUrl` difference between Playwright and Cypress.

### Risks

- Scaffolded projects must remain standalone (no post-scaffold dependency on the monorepo)
- The core package's API surface becomes a contract — breaking changes affect all templates
- Over-abstraction: only extract what is truly shared; framework-specific code stays in templates

---

## 2. Add Prettier

### Problem

The project has ESLint for code quality rules but no formatter. In a team setting, this means:
- PRs contain noise diffs from different editors using different formatting
- New engineers scaffolding projects get inconsistent formatting from the start
- No automated fix for formatting — only manual attention

### Current state

```
ESLint:     ✅ eslint.config.mjs in both templates (FlatConfig, ESLint 9.x)
Prettier:   ❌ No .prettierrc, no prettier dependency, no format script
EditorConfig: ❌ No .editorconfig
```

### Plan

Add Prettier to both templates and the root monorepo. Use `eslint-config-prettier` to disable ESLint rules that conflict.

### Before

**`templates/playwright-template/package.json`** scripts (no format command):
```json
{
  "scripts": {
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "npx playwright test",
    "test:smoke": "npx playwright test --grep @smoke",
    "test:regression": "npx playwright test --grep @regression",
    "test:critical": "npx playwright test --grep @critical"
  }
}
```

**`templates/playwright-template/eslint.config.mjs`** (no prettier integration):
```js
import tseslint from "typescript-eslint";
import architecturePlugin from "./lint/architecture-plugin.cjs";
// ... rules only, no prettier
```

### After

**New file: `templates/playwright-template/.prettierrc`**:
```json
{
  "printWidth": 100,
  "trailingComma": "none",
  "tabWidth": 2,
  "semi": true,
  "singleQuote": false
}
```

**New file: `templates/playwright-template/.prettierignore`**:
```
node_modules/
test-results/
playwright-report/
allure-results/
allure-report/
reports/
```

**Updated `templates/playwright-template/package.json`** scripts:
```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "npx playwright test",
    "test:smoke": "npx playwright test --grep @smoke",
    "test:regression": "npx playwright test --grep @regression",
    "test:critical": "npx playwright test --grep @critical"
  },
  "devDependencies": {
    "prettier": "^3.4.2",
    "eslint-config-prettier": "^9.1.0"
  }
}
```

**Updated `templates/playwright-template/eslint.config.mjs`**:
```js
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import architecturePlugin from "./lint/architecture-plugin.cjs";

export default tseslint.config(
  // ... existing rules ...
  prettierConfig  // must be last — disables conflicting ESLint rules
);
```

**Updated CI workflow** (`scripts/run-tests.sh` or GitHub Actions):
```bash
npm run format:check   # fails CI if files are unformatted
npm run lint
npm run typecheck
npx playwright test
```

### Same changes for Cypress template

Mirror the `.prettierrc`, `.prettierignore`, dependencies, and `format` / `format:check` scripts in `templates/cypress-template/`.

### Effort estimate

Small. 1-2 hours. Add dependencies, config files, scripts, and run `prettier --write .` once to baseline both templates.

### Risks

- Initial commit will touch every file (formatting baseline) — do this in a dedicated PR before other work
- Team must agree on config values (printWidth, quotes, trailing commas) upfront

---

## 3. Modularize and test the CLI

### Problem

`tools/create-qa-patterns/index.js` is a single 772-line file containing all CLI logic: argument parsing, terminal UI, prerequisite checks, filesystem operations, git initialization, post-install actions, and error recovery. There are zero tests for any of it.

This is the infrastructure code that every scaffolded project depends on. A bug here means every new project starts broken.

### Current structure (single file)

```
index.js (772 lines)
├── Constants & config          (lines 1-81)
├── Color/style utilities       (lines 83-110)
├── Help text                   (lines 112-128)
├── Node version validation     (lines 130-161)
├── Template resolution         (lines 163-169)
├── Sleep/command utilities      (lines 171-181)
├── Prerequisite checks         (lines 183-212)
├── Readline/prompt helpers     (lines 214-265)
├── Interactive template picker (lines 267-348)
├── Argument resolution         (lines 350-418)
├── Filesystem operations       (lines 420-498)
├── Scaffold orchestrator       (lines 509-546)
├── Command execution           (lines 548-594)
├── Success/summary output      (lines 596-670)
├── Post-generate actions       (lines 672-737)
└── Main entrypoint             (lines 739-772)
```

### Plan

**Phase 1: Extract into modules**

```
tools/create-qa-patterns/
  bin/
    create-qa-patterns.js       ← entrypoint (just calls main)
  src/
    cli.js                      ← main() orchestrator
    args.js                     ← argument parsing & resolution
    prerequisites.js            ← system tool detection
    prompt.js                   ← interactive picker, askYesNo, askQuestion
    scaffold.js                 ← filesystem: copy, customize, git init
    post-actions.js             ← npm install, playwright install, test run
    output.js                   ← colors, progress bar, summary, next steps
    templates.js                ← TEMPLATES constant, aliases, lookup
    version.js                  ← Node version check
  test/
    args.test.js                ← argument parsing unit tests
    prerequisites.test.js       ← tool detection (mockable)
    scaffold.test.js            ← filesystem operations (temp dirs)
    templates.test.js           ← alias resolution, lookup
    version.test.js             ← node version comparison
    cli.integration.test.js     ← end-to-end: scaffold a project, verify structure
  package.json
```

**Phase 2: Add unit tests for pure logic**

These are testable without mocking the filesystem or TTY:

```
args.test.js:
  - resolveNonInteractiveArgs([]) → default template, cwd
  - resolveNonInteractiveArgs(["playwright"]) → playwright template, cwd
  - resolveNonInteractiveArgs(["pw", "my-app"]) → playwright template, my-app dir
  - resolveNonInteractiveArgs(["my-app"]) → default template, my-app dir
  - resolveNonInteractiveArgs(["bad-template"]) → throws
  - resolveNonInteractiveArgs(["a", "b", "c"]) → throws (too many args)

templates.test.js:
  - resolveTemplate("playwright") → "playwright-template"
  - resolveTemplate("pw") → "playwright-template"
  - resolveTemplate("cypress") → "cypress-template"
  - resolveTemplate("cy") → "cypress-template"
  - resolveTemplate("unknown") → undefined

version.test.js:
  - parseNodeVersion("v18.18.0") → { major: 18, minor: 18, patch: 0 }
  - isNodeVersionSupported({ major: 18, minor: 18, patch: 0 }) → true
  - isNodeVersionSupported({ major: 16, minor: 0, patch: 0 }) → false
  - isNodeVersionSupported({ major: 20, minor: 0, patch: 0 }) → true
```

**Phase 3: Add integration test**

```js
// test/cli.integration.test.js
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

test("scaffold creates a valid playwright project", () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "qa-scaffold-"));
  const targetDir = path.join(tmpDir, "my-project");

  execSync(`node bin/create-qa-patterns.js playwright-template ${targetDir}`, {
    cwd: path.resolve(__dirname, ".."),
    stdio: "pipe"
  });

  // Verify structure
  expect(fs.existsSync(path.join(targetDir, "package.json"))).toBe(true);
  expect(fs.existsSync(path.join(targetDir, "playwright.config.ts"))).toBe(true);
  expect(fs.existsSync(path.join(targetDir, "tests"))).toBe(true);
  expect(fs.existsSync(path.join(targetDir, ".git"))).toBe(true);
  expect(fs.existsSync(path.join(targetDir, ".gitignore"))).toBe(true);

  // Verify package.json was customized
  const pkg = JSON.parse(fs.readFileSync(path.join(targetDir, "package.json"), "utf8"));
  expect(pkg.name).toBe("my-project");

  // Verify no node_modules leaked from monorepo
  expect(fs.existsSync(path.join(targetDir, "node_modules"))).toBe(false);

  // Cleanup
  fs.rmSync(tmpDir, { recursive: true, force: true });
});
```

### Before

```
tools/create-qa-patterns/
  index.js           ← 772 lines, everything in one file
  package.json
  templates/         ← bundled template copies
  README.md
```

### After

```
tools/create-qa-patterns/
  bin/
    create-qa-patterns.js    ← 5 lines (entrypoint)
  src/
    cli.js                   ← ~60 lines (orchestrator)
    args.js                  ← ~70 lines
    prerequisites.js         ← ~40 lines
    prompt.js                ← ~90 lines
    scaffold.js              ← ~80 lines
    post-actions.js          ← ~70 lines
    output.js                ← ~80 lines
    templates.js             ← ~40 lines
    version.js               ← ~35 lines
  test/
    args.test.js
    scaffold.test.js
    templates.test.js
    version.test.js
    cli.integration.test.js
  package.json               ← updated bin field, added test script + vitest
  templates/
  README.md
```

### Effort estimate

Medium-large. The extraction is mechanical but the integration test needs care (temp directories, process spawning, cleanup). Budget 2-3 days.

### Risks

- The `bin` field in `package.json` must be updated to point to `bin/create-qa-patterns.js`
- The `templates/` directory path resolution changes — must use `__dirname` relative to new file locations
- Interactive prompts (`selectTemplateInteractively`) are hard to unit test — keep them in `prompt.js` and integration-test them via process spawning with piped stdin

---

## 4. Build an upgrade mechanism

### Problem

Once a project is scaffolded, it's a fork. There's no way to pull improvements from upstream templates into existing projects. Over time, every scaffolded project diverges. At 50+ projects, you have 50 slightly different versions of the same patterns.

### Current flow

```
create-qa-patterns → fs.cpSync(template, target) → done forever
                                                    ↑
                                                    no way back
```

### Plan

Implement a lightweight `upgrade` command that shows a diff between the user's project and the latest template, letting the user selectively apply changes.

**Phase 1: Track template origin metadata**

During scaffolding, write a `.qa-patterns.json` file into the generated project:

```json
{
  "template": "playwright-template",
  "version": "1.2.0",
  "generatedAt": "2026-03-17T10:00:00Z",
  "cliVersion": "1.2.0"
}
```

**Phase 2: Add `create-qa-patterns upgrade` command**

```
create-qa-patterns upgrade [--dry-run]
```

Logic:
1. Read `.qa-patterns.json` from current directory
2. Resolve the matching template from the installed CLI version
3. Generate a unified diff between the template and the current project, excluding:
   - `node_modules/`, test artifacts, `.env` files, `.git/`
   - Files the user has explicitly marked as custom (via `.qa-patterns.json` ignore list)
4. Display the diff in a pager (or write to file with `--output`)
5. With `--apply`, copy new/changed template files into the project (with backup)

**Phase 3: Support `.qa-patterns-ignore`**

Users mark files they've intentionally customized:

```
# .qa-patterns-ignore
# These files have been customized and should not be overwritten during upgrade
config/environments.ts
playwright.config.ts
```

### Before

```
# No upgrade path exists. User must manually:
# 1. Generate a fresh project from the new template
# 2. Manually diff against their existing project
# 3. Copy changes one file at a time
```

### After

```bash
# Check what changed since you scaffolded
create-qa-patterns upgrade --dry-run

# Output:
# Comparing playwright-template v1.0.0 (your project) → v1.2.0 (latest)
#
# New files:
#   + utils/retry-helper.ts
#
# Modified files:
#   ~ config/secret-manager.ts (added getRequiredSecret method)
#   ~ lint/architecture-plugin.cjs (new rule: no-force-click)
#   ~ .github/workflows/playwright-tests.yml (updated Node version)
#
# Ignored (in .qa-patterns-ignore):
#   - config/environments.ts
#   - playwright.config.ts
#
# Run `create-qa-patterns upgrade --apply` to apply changes.

# Apply the upgrade (backs up changed files to .qa-patterns-backup/)
create-qa-patterns upgrade --apply
```

**New file: `.qa-patterns.json`** (written during scaffold):
```json
{
  "template": "playwright-template",
  "version": "1.2.0",
  "generatedAt": "2026-03-17T10:00:00Z",
  "cliVersion": "1.2.0"
}
```

**New file: `.qa-patterns-ignore`** (user-maintained):
```
# Files customized for this project — skip during upgrade
config/environments.ts
playwright.config.ts
```

### Effort estimate

Large. This is the most complex item on the list. The diff engine, ignore handling, backup/apply logic, and edge cases (renamed files, deleted files, merge conflicts) all need careful design. Budget 1-2 weeks.

### Risks

- Users may expect full merge conflict resolution (like git) — scope this as "show diff + copy" not "three-way merge"
- Version tracking requires the CLI version to be meaningful — must align with semver and release discipline
- The `.qa-patterns.json` must be added retroactively to existing scaffolded projects (migration guide needed)

---

## 5. Remove hardcoded credentials

### Problem

The demo apps and template config defaults contain hardcoded credentials:

| Location | Value |
|----------|-------|
| `test-apps/ui-demo-app/src/store.js:3` | `process.env.UI_DEMO_USERNAME \|\| "tester"` |
| `test-apps/ui-demo-app/src/store.js:4` | `process.env.UI_DEMO_PASSWORD \|\| "Password123!"` |
| `templates/playwright-template/config/environments.ts:17-18` | `username: "tester"`, `password: "Password123!"` |
| `templates/cypress-template/config/environments.ts:14-15` | `username: "tester"`, `password: "Password123!"` |

While these are demo-only credentials, internal security scanners (Semgrep, TruffleHog, GitHub secret scanning) will flag them in every scaffolded project. Engineers will waste time writing exemptions or ignoring scanner results — both bad outcomes.

### Plan

Move all credentials to `.env.example` and `.env` files. The demo apps and template defaults reference environment variables only, with no inline fallbacks.

### Before

**`test-apps/ui-demo-app/src/store.js`** (hardcoded fallbacks):
```js
const state = {
  credentials: {
    username: process.env.UI_DEMO_USERNAME || "tester",
    password: process.env.UI_DEMO_PASSWORD || "Password123!"
  },
  people: []
};
```

**`templates/playwright-template/config/environments.ts`** (hardcoded in defaults):
```ts
const DEFAULTS: Record<TestEnvironment, EnvironmentDefaults> = {
  dev: {
    uiBaseUrl: "http://127.0.0.1:3000",
    apiBaseUrl: "http://127.0.0.1:3001",
    credentials: {
      username: "tester",
      password: "Password123!"
    }
  },
  staging: {
    uiBaseUrl: "https://staging-ui.example.internal",
    apiBaseUrl: "https://staging-api.example.internal",
    credentials: {
      username: "staging-user",
      password: "replace-me"
    }
  },
  // ...
};
```

### After

**`test-apps/ui-demo-app/src/store.js`** (env-only, fail if missing):
```js
function requiredEnv(key) {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing environment variable "${key}". ` +
      `Copy .env.example to .env and fill in the values.`
    );
  }
  return value;
}

const state = {
  credentials: {
    username: requiredEnv("UI_DEMO_USERNAME"),
    password: requiredEnv("UI_DEMO_PASSWORD")
  },
  people: []
};
```

**`test-apps/ui-demo-app/.env.example`** (checked into source):
```env
# Demo app credentials — copy this file to .env
UI_DEMO_USERNAME=tester
UI_DEMO_PASSWORD=Password123!
```

**`test-apps/ui-demo-app/.env`** (gitignored, created by setup script):
```env
UI_DEMO_USERNAME=tester
UI_DEMO_PASSWORD=Password123!
```

**`templates/playwright-template/config/environments.ts`** (no inline credentials):
```ts
const DEFAULTS: Record<TestEnvironment, EnvironmentDefaults> = {
  dev: {
    uiBaseUrl: "http://127.0.0.1:3000",
    apiBaseUrl: "http://127.0.0.1:3001"
  },
  staging: {
    uiBaseUrl: "https://staging-ui.example.internal",
    apiBaseUrl: "https://staging-api.example.internal"
  },
  prod: {
    uiBaseUrl: "https://ui.example.internal",
    apiBaseUrl: "https://api.example.internal"
  }
};
```

Credentials are loaded exclusively through the `SecretManager` → `EnvSecretProvider` chain, which reads from environment variables (set via `.env` files or CI secrets).

**Updated `templates/playwright-template/.env.example`**:
```env
# Test environment: dev | staging | prod
TEST_ENV=dev

# Demo app credentials (dev only — use secret manager for staging/prod)
APP_USERNAME=tester
APP_PASSWORD=Password123!

# Override base URLs if not using defaults
# UI_BASE_URL=http://127.0.0.1:3000
# API_BASE_URL=http://127.0.0.1:3001
```

**Updated scaffold flow**: The CLI copies `.env.example` → `.env` during project generation so new projects work out of the box without manual setup.

### Effort estimate

Small-medium. The code changes are straightforward. The coordination effort is in:
- Updating CI workflows to set the env vars explicitly
- Updating the docs to reflect the new setup step
- Updating the CLI to copy `.env.example` → `.env` during scaffold

### Risks

- Breaks the "zero config" experience slightly — new users must have `.env` present. Mitigated by the CLI auto-copying `.env.example` → `.env` during scaffold.
- Existing scaffolded projects will need a migration note in their upgrade path.

---

## 6. Validate scaffolded project CI end-to-end

### Problem

The monorepo CI validates the templates within the monorepo context (workspace resolution, shared `node_modules`, monorepo-relative paths). But a freshly scaffolded standalone project has a different structure. There's no test that proves a scaffolded project actually works end-to-end: install, lint, typecheck, test, CI workflow.

The CI workflows bundled inside templates (`templates/playwright-template/.github/workflows/playwright-tests.yml`) reference paths and triggers that may not match a standalone project's structure.

### Plan

Add a new CI job that scaffolds a project from scratch and validates the full lifecycle.

### Before

**Current CI** (`/.github/workflows/playwright-tests.yml`):
```yaml
# Only validates templates IN the monorepo
jobs:
  playwright-template:
    steps:
      - uses: actions/checkout@v4
      - run: npm ci                          # monorepo install
      - run: npx playwright install --with-deps
      - run: npm run lint -w templates/playwright-template
      - run: npm run typecheck -w templates/playwright-template
      - run: npm test -w templates/playwright-template
```

This does NOT validate:
- That `fs.cpSync` produces a working standalone project
- That `package.json` has all required dependencies (not leaking from monorepo hoisting)
- That the bundled CI workflow file is valid for a standalone repo
- That the `.gitignore`, `.env.example`, and other generated files are correct

### After

**New CI job** (add to `.github/workflows/playwright-tests.yml` or create new file):
```yaml
  scaffold-validation:
    name: Validate scaffolded project (end-to-end)
    runs-on: ubuntu-latest
    strategy:
      matrix:
        template: [playwright-template, cypress-template]
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: "22"

      # Scaffold a fresh project using the CLI (no monorepo context)
      - name: Scaffold project
        run: |
          node tools/create-qa-patterns/index.js ${{ matrix.template }} /tmp/scaffolded-project

      # Verify file structure
      - name: Verify generated files
        run: |
          cd /tmp/scaffolded-project
          test -f package.json
          test -f .gitignore
          test -d .git
          test -f tsconfig.json

      # Install dependencies (standalone — no workspace resolution)
      - name: Install dependencies
        run: |
          cd /tmp/scaffolded-project
          npm install

      # Install browsers (Playwright only)
      - name: Install Playwright browsers
        if: matrix.template == 'playwright-template'
        run: |
          cd /tmp/scaffolded-project
          npx playwright install --with-deps

      # Run lint
      - name: Lint
        run: |
          cd /tmp/scaffolded-project
          npm run lint

      # Run typecheck
      - name: Typecheck
        run: |
          cd /tmp/scaffolded-project
          npm run typecheck

      # Run tests
      - name: Run tests
        run: |
          cd /tmp/scaffolded-project
          npm test
        env:
          TEST_ENV: dev
          TEST_RUN_ID: scaffold-validation

      # Validate the bundled CI workflow is valid YAML
      - name: Validate bundled CI workflow
        run: |
          cd /tmp/scaffolded-project
          if [ -d ".github/workflows" ]; then
            for f in .github/workflows/*.yml; do
              echo "Validating $f"
              python3 -c "import yaml; yaml.safe_load(open('$f'))"
            done
          fi
```

**Additionally, add a local validation script** for developers:

**New file: `scripts/validate-scaffold.sh`**:
```bash
#!/usr/bin/env bash
set -euo pipefail

TEMPLATE="${1:-playwright-template}"
TARGET_DIR=$(mktemp -d)

echo "Scaffolding ${TEMPLATE} into ${TARGET_DIR}..."
node tools/create-qa-patterns/index.js "${TEMPLATE}" "${TARGET_DIR}"

echo "Installing dependencies..."
cd "${TARGET_DIR}"
npm install

if [ "${TEMPLATE}" = "playwright-template" ]; then
  echo "Installing Playwright browsers..."
  npx playwright install --with-deps
fi

echo "Running lint..."
npm run lint

echo "Running typecheck..."
npm run typecheck

echo "Running tests..."
TEST_ENV=dev TEST_RUN_ID=validate npm test

echo ""
echo "Scaffold validation passed for ${TEMPLATE}"

rm -rf "${TARGET_DIR}"
```

### Effort estimate

Small-medium. The CI job is mostly configuration. The tricky part is ensuring the demo apps start correctly in the standalone context (no monorepo symlinks, no workspace protocol).

### Risks

- CI time increases (scaffolding + full install + browser install per template). Mitigate by running this job only on `main` pushes and PRs that touch `templates/` or `tools/`.
- The scaffold validation job depends on the demo apps being bundled correctly — if `demo-apps/` in the template contains symlinks to `test-apps/`, they'll break outside the monorepo. This test will catch that.

---

## Priority and sequencing

| # | Item | Effort | Impact | Dependencies | Suggested order |
|---|------|--------|--------|-------------|----------------|
| 6 | Validate scaffolded project CI | Small | High | None | **Do first** — catches existing breakage |
| 2 | Add Prettier | Small | Medium | None | **Do second** — baseline formatting before other changes |
| 5 | Remove hardcoded credentials | Small-Med | High | None | **Do third** — security scanner noise blocks adoption |
| 3 | Modularize and test the CLI | Med-Large | High | None | **Do fourth** — prerequisite for upgrade mechanism |
| 1 | Extract shared config package | Medium | Medium | None (but easier after #3) | **Do fifth** — reduces maintenance, prevents further drift |
| 4 | Build upgrade mechanism | Large | High | Requires #3 | **Do last** — highest effort, highest long-term value |

### Recommended execution

```
Week 1:   #6 (scaffold validation) + #2 (prettier)
Week 2:   #5 (credentials) + #3 start (CLI modularization)
Week 3:   #3 finish (CLI tests) + #1 (shared config extraction)
Week 4-5: #4 (upgrade mechanism)
```

---

## Decision log

| Decision | Rationale |
|----------|-----------|
| Core package copied into scaffold output (not an npm dependency) | Scaffolded projects must remain standalone with no external runtime dependencies |
| Prettier over dprint/Biome | Prettier has the largest ecosystem adoption, ESLint integration is mature, team familiarity is highest |
| Vitest for CLI tests over Jest/node:test | Already used in modern JS ecosystem, fast, ESM-friendly, good for both unit and integration |
| Diff-based upgrade over runtime package (a la CRA) | Lower coupling, simpler mental model, no version lock-in. Users see exactly what changes before applying |
| `.env` for credentials over config defaults | Security scanner compatibility, principle of least surprise, matches 12-factor app conventions |
| Scaffold validation in CI over local-only | Must catch breakage automatically; local scripts are optional convenience |
