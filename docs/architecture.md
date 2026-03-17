# Framework Architecture

## Repository layout

- `packages/qa-patterns-core`: shared source files used by both templates (config, data factories, generators)
- `templates/playwright-template`: the main automation framework template
- `templates/cypress-template`: Cypress UI automation template with Cypress-native commands and support modules
- `test-apps/ui-demo-app`: deterministic UI app used by browser tests
- `test-apps/api-demo-server`: deterministic API app used by API tests
- `tools/create-qa-patterns`: scaffolding CLI for the included templates
- `docs`: usage and extension guides

## Shared code (qa-patterns-core)

Config, data factory, ID generator, and seeded faker logic is shared between the Playwright and Cypress templates. The canonical source lives in `packages/qa-patterns-core/src/`. A sync script copies these files into each template with any framework-specific transforms applied.

- Edit shared code in `packages/qa-patterns-core/src/`
- Run `npm run sync` to propagate changes to both templates and CLI bundles
- Run `npm run sync:check` (also runs in CI) to verify templates are in sync

Scaffolded projects receive full standalone copies of all files. There is no runtime dependency on the shared package.

## Playwright template layout

- `tests`: business-level test flows and assertions
- `pages`: page objects that own locators and user actions
- `components`: reusable UI fragments shared by pages
- `fixtures`: shared runtime wiring for config, data, logger, and page objects
- `data/factories`: generic builders such as `DataFactory.person()`
- `data/generators`: deterministic ID and faker helpers
- `config`: environment loading and secret access
- `utils`: logging and test step helpers
- `reporters`: custom structured reporter output
- `lint`: local ESLint rules that enforce framework standards
- `docker`: container setup for CI

## Cypress template layout

- `cypress/e2e`: UI workflow specs
- `cypress/support/commands.ts`: shared Cypress commands such as sign-in and add-person workflows
- `cypress/support/pages`: selector-owning page modules used by commands and specs
- `cypress/support/data`: generic deterministic data builders
- `config`: environment loading and secret access for Cypress runtime setup
- `demo-apps`: bundled UI app used by the template locally and in CI
- `scripts`: local run helpers for auto-starting the demo app when appropriate

## Design rules

- tests should describe user behavior, not selectors
- locators should stay in page objects or support/page modules
- assertions should stay in test files
- data generation should come from factories, not inline object literals everywhere
- the starter should stay small enough to understand quickly

## Determinism

- demo app state is in memory and resets on process start
- default ports are fixed
- `TEST_RUN_ID` can be used to generate stable test data per run
- the example data layer stays generic on purpose
