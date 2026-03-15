import type { Page } from "@playwright/test";

import type { Logger } from "../utils/logger";
import { BasePage } from "./base-page";

export class DashboardPage extends BasePage {
  constructor(page: Page, baseUrl: string, logger: Logger) {
    super(page, baseUrl, logger);
  }

  async waitForReady(): Promise<void> {
    this.logger.info("page.ready", { page: "dashboard" });
    await this.page.getByRole("heading", { level: 1, name: "Dashboard", exact: true }).waitFor();
  }

  async getWelcomeMessage(): Promise<string> {
    return (await this.page.getByTestId("welcome-message").textContent()) ?? "";
  }

  async getMetric(metricName: "customers" | "accounts" | "transactions"): Promise<number> {
    const value = await this.page.getByTestId(`metric-${metricName}`).textContent();
    return Number(value ?? "0");
  }
}
