# Local Development

## Install dependencies

Run this once from the repository root:

```bash
npm install
```

## Start the deterministic applications

Run each service in its own terminal:

```bash
npm run dev:ui
```

```bash
npm run dev:api
```

The default endpoints are:

- UI app: `http://127.0.0.1:3000`
- API server: `http://127.0.0.1:3001`

## Run the Playwright template

From the repository root:

```bash
npm test
```

The default example covers:

- sign in
- add one person
- verify the list

Tag-filtered runs:

```bash
npm run test:smoke
```

```bash
npm run test:regression
```

## Environment and secrets

- `TEST_ENV` selects `dev`, `staging`, or `prod`.
- The template resolves `DEV_*`, `STAGING_*`, or `PROD_*` values first, then falls back to generic keys.
- Copy `templates/playwright-template/.env.example` to `templates/playwright-template/.env` for local overrides.
