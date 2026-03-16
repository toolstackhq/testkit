# Run Locally

## Install

From the repository root:

```bash
npm install
```

Node `18.18+` is required.

## Start the demo apps

Run each app in its own terminal from the repository root:

```bash
npm run dev:ui
```

```bash
npm run dev:api
```

Default endpoints:

- UI app: `http://127.0.0.1:3000`
- API server: `http://127.0.0.1:3001`

## Run tests

From the repository root:

```bash
npm test
```

Targeted runs:

```bash
npm run test:smoke
```

```bash
npm run test:regression
```

The current example flow is intentionally small:

- sign in
- add one person
- verify the list

## Local config

The Playwright template supports:

- `TEST_ENV=dev`
- `TEST_ENV=staging`
- `TEST_ENV=prod`

For local overrides, copy:

```bash
templates/playwright-template/.env.example
```

to:

```bash
templates/playwright-template/.env
```

The template loads:

- `.env`
- `.env.<TEST_ENV>`

with environment-specific values taking priority.
