import type { Page } from "@playwright/test";

import type { Customer } from "../data/schemas/domain-schemas";
import type { Logger } from "../utils/logger";
import { BasePage } from "./base-page";

export class CustomersPage extends BasePage {
  constructor(page: Page, baseUrl: string, logger: Logger) {
    super(page, baseUrl, logger);
  }

  async waitForReady(): Promise<void> {
    await this.page.getByRole("heading", { name: "Customers" }).waitFor();
  }

  async createCustomer(customer: Customer): Promise<void> {
    this.logger.info("customer.create", { customerId: customer.customerId });
    await this.page.getByLabel("Customer ID").fill(customer.customerId);
    await this.page.getByLabel("First Name").fill(customer.firstName);
    await this.page.getByLabel("Last Name").fill(customer.lastName);
    await this.page.getByLabel("Email").fill(customer.email);
    await this.page.getByRole("button", { name: "Create customer" }).click();
    await this.page.waitForLoadState("networkidle");
  }

  async getCustomerSummary(customerId: string): Promise<{ name: string; email: string } | null> {
    const row = this.page.getByTestId(`customer-row-${customerId}`);
    if (!(await row.count())) {
      return null;
    }

    const cells = row.getByRole("cell");
    return {
      name: (await cells.nth(1).textContent()) ?? "",
      email: (await cells.nth(2).textContent()) ?? ""
    };
  }
}
