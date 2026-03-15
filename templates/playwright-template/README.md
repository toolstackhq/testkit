# Playwright Template

This template demonstrates a maintainable Playwright automation architecture built around business workflows instead of raw browser interactions.

## Highlights

- TypeScript-first framework structure with page objects, components, fixtures, utilities, and environment-aware configuration.
- Structured data generation using deterministic factories and generators backed by `zod` schemas.
- Environment and secret abstractions that resolve values per `TEST_ENV`.
- Architecture guardrails enforced with local ESLint rules.
- CI-ready reporting with HTML reports, JSONL execution events, traces, screenshots, and video artifacts on failure.

## Structure

```text
playwright-template
├── tests
├── pages
├── components
├── fixtures
├── data
│   ├── factories
│   ├── generators
│   └── schemas
├── config
├── utils
├── reporters
├── lint
├── scripts
├── docker
└── .github/workflows
```

## Running locally

1. Copy `.env.example` to `.env` if you need overrides.
2. Start the demo applications from the repository root:
   - `npm run dev:ui`
   - `npm run dev:api`
3. Install workspace dependencies from the repository root with `npm install`.
4. Run tests from this directory with `npm test`.

## Design rules

- Tests describe workflows and assertions only.
- Page objects and components own selectors.
- Page objects return state; assertions stay in test files.
- `waitForTimeout` is forbidden.
- Tags such as `@smoke`, `@regression`, and `@critical` are used for targeted runs.

## CI usage

- `scripts/run-tests.sh` is the CI entrypoint.
- The included GitHub Actions workflow validates the template twice: once directly on the runner and once by building and running `docker/Dockerfile`.
- `docker/Dockerfile` is therefore a first-class CI path, not just a reference artifact.
