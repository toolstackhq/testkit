import { expect, test } from "../../fixtures/test-fixtures";

test.describe("Customer onboarding journeys", () => {
  test("create customer, open account, perform transaction, validate balance @smoke @critical", async ({
    appConfig,
    loginPage,
    dashboardPage,
    customersPage,
    accountsPage,
    transactionsPage,
    customerFactory,
    stepLogger
  }) => {
    const scenario = customerFactory.createCustomerOnboardingScenario();

    await stepLogger.run("Authenticate into the UI demo application", async () => {
      await loginPage.goto();
      await loginPage.login(appConfig.credentials.username, appConfig.credentials.password);
      await dashboardPage.waitForReady();
      expect(await dashboardPage.getWelcomeMessage()).toContain(appConfig.credentials.username);
    });

    await stepLogger.run("Create a customer profile", async () => {
      await dashboardPage.nav.openCustomers();
      await customersPage.waitForReady();
      await customersPage.createCustomer(scenario.customer);

      expect(await customersPage.getCustomerSummary(scenario.customer.customerId)).toEqual({
        name: `${scenario.customer.firstName} ${scenario.customer.lastName}`,
        email: scenario.customer.email
      });
    });

    await stepLogger.run("Open a new account for the customer", async () => {
      await customersPage.nav.openAccounts();
      await accountsPage.waitForReady();
      await accountsPage.openAccount(scenario.account);

      expect(await accountsPage.getBalanceForAccount(scenario.account.accountId)).toBe(
        scenario.account.initialDeposit
      );
    });

    await stepLogger.run("Perform a deposit transaction", async () => {
      await accountsPage.nav.openTransactions();
      await transactionsPage.waitForReady();
      await transactionsPage.postDeposit(scenario.transaction);

      expect(await transactionsPage.getTransactionDescription(scenario.transaction.transactionId)).toBe(
        scenario.transaction.description
      );
    });

    await stepLogger.run("Validate the updated account balance", async () => {
      await transactionsPage.nav.openAccounts();
      await accountsPage.waitForReady();

      expect(await accountsPage.getBalanceForAccount(scenario.account.accountId)).toBe(
        scenario.expectedBalance
      );
      await accountsPage.nav.openDashboard();
      await dashboardPage.waitForReady();
      expect(await dashboardPage.getMetric("customers")).toBe(1);
    });
  });
});
