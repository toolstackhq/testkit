# qa-patterns

`qa-patterns` is a repository of reusable test automation patterns.

It currently includes:

- a Playwright + TypeScript framework template
- a deterministic UI demo app for browser testing
- a deterministic API demo server for API testing
- CI, linting, reporting, and extension patterns

## Quick start

1. Install dependencies:

```bash
npm install
```

2. Start the demo apps in separate terminals:

```bash
npm run dev:ui
```

```bash
npm run dev:api
```

3. Run the Playwright template:

```bash
npm test
```

## What the framework includes

- page objects with selectors kept out of test files
- reusable fixtures for config, logging, data, and pages
- generic test data with `DataFactory`
- environment-aware runtime config with `TEST_ENV=dev|staging|prod`
- env-based secret resolution through a `SecretManager`
- Playwright HTML reporting by default
- optional Allure single-file reporting
- ESLint rules to protect framework conventions
- GitHub Actions and Docker support for CI

## Main commands

From the repository root:

```bash
npm test
npm run test:smoke
npm run test:regression
npm run lint
npm run typecheck
```

From `templates/playwright-template`:

```bash
npm run report:playwright
npm run report:allure
```

## Documentation

- [Docs index](./docs/README.md)
- [Run locally](./docs/local-development.md)
- [Write and extend tests](./docs/extending-the-repository.md)
- [Framework architecture](./docs/architecture.md)
- [Reporting](./docs/reporting.md)
- [CI and quality checks](./docs/ci-and-quality.md)
- [Security and secrets](./docs/security.md)
- [Playwright template package](./templates/playwright-template/README.md)

## Default local credentials

- username: `tester`
- password: `Password123!`
