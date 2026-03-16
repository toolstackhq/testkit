# Reporting

## Default report

The default report is Playwright HTML:

```bash
cd templates/playwright-template
npm run report:playwright
```

Output:

- `reports/html`

This should be the main path for most users.

## Allure

Allure is included as an optional richer report:

```bash
cd templates/playwright-template
npm run report:allure
```

Output:

- `reports/allure/index.html`

Raw Allure results are written to:

- `allure-results`

If you want only Playwright reporting, remove the `allure-playwright` reporter entry in:

```bash
templates/playwright-template/playwright.config.ts
```

## Failure artifacts

The template keeps:

- traces on failure
- screenshots on failure
- videos on failure
- structured JSONL execution logs

Locations:

- `test-results`
- `reports/logs`

## Structured logs

The custom structured reporter writes:

- `reports/logs/playwright-events.jsonl`

This is useful for CI diagnostics and machine-readable processing.
