# Write And Extend Tests

## Add a new test

Add new tests under:

```bash
templates/playwright-template/tests
```

or:

```bash
templates/cypress-template/cypress/e2e
```

Use the shared fixtures:

```ts
import { expect, test } from "../fixtures/test-fixtures";
```

Keep each test focused on a short workflow:

- prepare data with `dataFactory`
- drive the app through page objects
- assert in the test

## Add a new page object

Create a new file under:

```bash
templates/playwright-template/pages
```

For Cypress page modules, add files under:

```bash
templates/cypress-template/cypress/support/pages
```

Rules:

- keep locators in the page object
- expose user actions and simple state reads
- do not put `expect()` assertions in the page object

## Extend fixtures

Update:

```bash
templates/playwright-template/fixtures/test-fixtures.ts
```

This is where shared objects are wired into tests, including:

- runtime config
- logger
- step logger
- data factory
- page objects

If you add a new page or helper used across many tests, add it here.

For Cypress, shared commands live in:

```bash
templates/cypress-template/cypress/support/commands.ts
```

## Extend data

Start with generic data in:

```bash
templates/playwright-template/data/factories
```

or for Cypress:

```bash
templates/cypress-template/cypress/support/data
```

Current pattern:

- `DataFactory.person()`

Only add domain-specific factories when the project actually needs them.

## Add tags

The template supports tags in test titles:

- `@smoke`
- `@regression`
- `@critical`

Example:

```ts
test("login and add one person @smoke @critical", async () => {
  // ...
});
```

## Extend the repository

To add another framework template:

1. create a new package under `templates/`
2. decide whether it should be a root workspace or a standalone template package
3. include its own README, CI workflow, and at least one deterministic example

To add another demo app:

1. create it under `test-apps/`
2. keep its state deterministic
3. expose a `/health` endpoint
4. document its port and default credentials
