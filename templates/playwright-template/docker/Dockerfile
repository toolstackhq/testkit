FROM node:20-bookworm-slim

WORKDIR /workspace

COPY package.json tsconfig.json playwright.config.ts eslint.config.mjs ./
COPY config ./config
COPY components ./components
COPY data ./data
COPY fixtures ./fixtures
COPY lint ./lint
COPY pages ./pages
COPY reporters ./reporters
COPY scripts ./scripts
COPY tests ./tests
COPY utils ./utils
COPY .env.example ./.env.example

RUN npm install
RUN npx playwright install --with-deps chromium

CMD ["bash", "./scripts/run-tests.sh"]
