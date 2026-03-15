import { test as base } from "@playwright/test";

import { loadRuntimeConfig, type RuntimeConfig } from "../config/runtime-config";
import { CustomerFactory } from "../data/factories/customer-factory";
import { AccountsPage } from "../pages/accounts-page";
import { CustomersPage } from "../pages/customers-page";
import { DashboardPage } from "../pages/dashboard-page";
import { LoginPage } from "../pages/login-page";
import { TransactionsPage } from "../pages/transactions-page";
import { createLogger, type Logger } from "../utils/logger";
import { StepLogger } from "../utils/test-step";

type FrameworkFixtures = {
  appConfig: RuntimeConfig;
  logger: Logger;
  stepLogger: StepLogger;
  customerFactory: CustomerFactory;
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  customersPage: CustomersPage;
  accountsPage: AccountsPage;
  transactionsPage: TransactionsPage;
};

export const test = base.extend<FrameworkFixtures>({
  appConfig: async ({}, use) => {
    await use(loadRuntimeConfig());
  },
  logger: async ({}, use, testInfo) => {
    const logger = createLogger({
      test: testInfo.titlePath.join(" > ")
    });
    await use(logger);
  },
  stepLogger: async ({ logger }, use) => {
    await use(new StepLogger(logger.child({ scope: "steps" })));
  },
  customerFactory: async ({ appConfig }, use) => {
    await use(new CustomerFactory(appConfig.testRunId));
  },
  loginPage: async ({ page, appConfig, logger }, use) => {
    await use(new LoginPage(page, appConfig.uiBaseUrl, logger.child({ pageObject: "LoginPage" })));
  },
  dashboardPage: async ({ page, appConfig, logger }, use) => {
    await use(new DashboardPage(page, appConfig.uiBaseUrl, logger.child({ pageObject: "DashboardPage" })));
  },
  customersPage: async ({ page, appConfig, logger }, use) => {
    await use(new CustomersPage(page, appConfig.uiBaseUrl, logger.child({ pageObject: "CustomersPage" })));
  },
  accountsPage: async ({ page, appConfig, logger }, use) => {
    await use(new AccountsPage(page, appConfig.uiBaseUrl, logger.child({ pageObject: "AccountsPage" })));
  },
  transactionsPage: async ({ page, appConfig, logger }, use) => {
    await use(
      new TransactionsPage(page, appConfig.uiBaseUrl, logger.child({ pageObject: "TransactionsPage" }))
    );
  }
});

export { expect } from "@playwright/test";
