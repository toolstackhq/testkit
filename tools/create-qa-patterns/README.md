# @toolstackhq/create-qa-patterns

CLI for generating QA framework templates from `qa-patterns`.

## Install

```bash
npm install -g @toolstackhq/create-qa-patterns
```

## Usage

```bash
create-qa-patterns
```

Generate into a new directory:

```bash
create-qa-patterns my-project
```

The generated project is initialized with `git init` automatically and includes a default `.gitignore` for common local artifacts.

Generate the Playwright template explicitly:

```bash
create-qa-patterns playwright-template my-project
```

Generate the Cypress template explicitly:

```bash
create-qa-patterns cypress-template my-project
```

## Supported templates

- `playwright-template`
- `cypress-template`

## Interactive flow

When run in a terminal, the CLI shows:

- a template picker with keyboard selection
- short template descriptions
- scaffold progress while files are generated
- optional post-generate actions for:
  - `npm install`
  - `npm test`

For Playwright projects, the interactive flow also offers:

- `npx playwright install`

## Prerequisite checks

The CLI checks:

- required Node.js version
- `npm` availability for install and test actions
- `npx` availability for template setup that depends on it
- `docker` availability and warns if it is missing
- `git` availability so the scaffold can start as a repository immediately

If `npx playwright install` fails because the host is missing browser dependencies, the CLI keeps the generated project and prints the recovery steps instead of treating scaffold generation as failed.
