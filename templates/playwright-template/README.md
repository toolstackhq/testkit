# Playwright Template

This is a Playwright + TypeScript automation framework template.

It includes:

- page objects
- shared fixtures
- generic test data
- environment-aware config
- env-based secret management
- Playwright HTML reporting
- optional Allure reporting
- lint rules for framework conventions
- CI and Docker support

## Main commands

From the repository root:

```bash
npm test
npm run test:smoke
npm run test:regression
npm run lint
npm run typecheck
```

From this directory:

```bash
npm run report:playwright
npm run report:allure
```

## Read next

- [Run locally](../../docs/local-development.md)
- [Framework architecture](../../docs/architecture.md)
- [Write and extend tests](../../docs/extending-the-repository.md)
- [Reporting](../../docs/reporting.md)
- [CI and quality checks](../../docs/ci-and-quality.md)
- [Security and secrets](../../docs/security.md)

## Important defaults

- default UI URL: `http://127.0.0.1:3000`
- default API URL: `http://127.0.0.1:3001`
- default username: `tester`
- default password: `Password123!`
