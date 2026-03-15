import type { Page } from "@playwright/test";

import type { Account } from "../data/schemas/domain-schemas";
import type { Logger } from "../utils/logger";
import { BasePage } from "./base-page";

function parseCurrency(value: string | null): number {
  return Number((value ?? "0").replace(/[$,]/g, ""));
}

export class AccountsPage extends BasePage {
  constructor(page: Page, baseUrl: string, logger: Logger) {
    super(page, baseUrl, logger);
  }

  async waitForReady(): Promise<void> {
    await this.page.getByRole("heading", { name: "Accounts" }).waitFor();
  }

  async openAccount(account: Account): Promise<void> {
    this.logger.info("account.create", { accountId: account.accountId });
    await this.page.getByLabel("Account ID").fill(account.accountId);
    await this.page.getByLabel("Customer ID").fill(account.customerId);
    await this.page.getByLabel("Account Type").selectOption(account.accountType);
    await this.page.getByLabel("Opening Balance").fill(account.initialDeposit.toFixed(2));
    await this.page.getByRole("button", { name: "Open account" }).click();
    await this.page.waitForLoadState("networkidle");
  }

  async getBalanceForAccount(accountId: string): Promise<number> {
    const row = this.page.getByTestId(`account-row-${accountId}`);
    const balance = await row.getByRole("cell").nth(3).textContent();
    return parseCurrency(balance);
  }
}
