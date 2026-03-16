# Framework Architecture

## Repository layout

- `templates/playwright-template`: the main automation framework template
- `test-apps/ui-demo-app`: deterministic UI app used by browser tests
- `test-apps/api-demo-server`: deterministic API app used by API tests
- `tools/create-qa-patterns`: future scaffolding CLI
- `docs`: usage and extension guides

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

## Design rules

- tests should describe user behavior, not selectors
- locators should stay in page objects
- assertions should stay in test files
- data generation should come from factories, not inline object literals everywhere
- the starter should stay small enough to understand quickly

## Determinism

- demo app state is in memory and resets on process start
- default ports are fixed
- `TEST_RUN_ID` can be used to generate stable test data per run
- the example data layer stays generic on purpose
