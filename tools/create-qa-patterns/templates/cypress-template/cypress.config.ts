import { defineConfig } from "cypress";

import { loadRuntimeConfig } from "./config/runtime-config";

const runtimeConfig = loadRuntimeConfig();

export default defineConfig({
  e2e: {
    baseUrl: runtimeConfig.uiBaseUrl,
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    setupNodeEvents(_on, config) {
      config.env = {
        ...config.env,
        testEnv: runtimeConfig.testEnv,
        testRunId: runtimeConfig.testRunId,
        credentials: runtimeConfig.credentials
      };

      return config;
    }
  },
  fixturesFolder: false,
  retries: {
    runMode: 1,
    openMode: 0
  },
  screenshotOnRunFailure: true,
  video: true,
  videosFolder: "reports/videos",
  screenshotsFolder: "reports/screenshots"
});
