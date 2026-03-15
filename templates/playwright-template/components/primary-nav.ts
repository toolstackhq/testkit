import type { Page } from "@playwright/test";

import type { Logger } from "../utils/logger";

export class PrimaryNav {
  constructor(
    private readonly page: Page,
    private readonly logger: Logger
  ) {}

  async openDashboard(): Promise<void> {
    this.logger.info("navigation.open", { destination: "dashboard" });
    await this.page.getByRole("link", { name: "Dashboard" }).click();
  }

  async openCustomers(): Promise<void> {
    this.logger.info("navigation.open", { destination: "customers" });
    await this.page.getByRole("link", { name: "Customers" }).click();
  }

  async openAccounts(): Promise<void> {
    this.logger.info("navigation.open", { destination: "accounts" });
    await this.page.getByRole("link", { name: "Accounts" }).click();
  }

  async openTransactions(): Promise<void> {
    this.logger.info("navigation.open", { destination: "transactions" });
    await this.page.getByRole("link", { name: "Transactions" }).click();
  }
}
