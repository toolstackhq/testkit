import { defineConfig } from "allure";

export default defineConfig({
  name: "qa-patterns Playwright Template",
  output: "reports/allure",
  plugins: {
    awesome: {
      options: {
        reportName: "qa-patterns Playwright Template",
        singleFile: false
      }
    }
  }
});
