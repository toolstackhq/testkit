import type { Page } from "@playwright/test";

import type { Transaction } from "../data/schemas/domain-schemas";
import type { Logger } from "../utils/logger";
import { BasePage } from "./base-page";

export class TransactionsPage extends BasePage {
  constructor(page: Page, baseUrl: string, logger: Logger) {
    super(page, baseUrl, logger);
  }

  async waitForReady(): Promise<void> {
    await this.page.getByRole("heading", { level: 1, name: "Transactions", exact: true }).waitFor();
  }

  async postDeposit(transaction: Transaction): Promise<void> {
    this.logger.info("transaction.create", { transactionId: transaction.transactionId });
    await this.page.getByLabel("Transaction ID").fill(transaction.transactionId);
    await this.page.getByLabel("Account ID").fill(transaction.accountId);
    await this.page.getByLabel("Amount").fill(transaction.amount.toFixed(2));
    await this.page.getByLabel("Description").fill(transaction.description);
    await this.page.getByRole("button", { name: "Post deposit" }).click();
    await this.page.waitForLoadState("networkidle");
  }

  async getTransactionDescription(transactionId: string): Promise<string | null> {
    const row = this.page.getByTestId(`transaction-row-${transactionId}`);
    if (!(await row.count())) {
      return null;
    }
    return row.getByRole("cell").nth(3).textContent();
  }
}
