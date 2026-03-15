import { expect, test } from "../fixtures/test-fixtures";

test.describe("Banking API workflows", () => {
  test("create customer, open account, perform transaction through API @regression", async ({
    appConfig,
    customerFactory,
    request,
    stepLogger
  }) => {
    const scenario = customerFactory.createCustomerOnboardingScenario();

    await stepLogger.run("Create a customer through the API", async () => {
      const response = await request.post(`${appConfig.apiBaseUrl}/customers`, {
        data: scenario.customer
      });
      expect(response.ok()).toBeTruthy();
      expect(await response.json()).toMatchObject(scenario.customer);
    });

    await stepLogger.run("Open an account through the API", async () => {
      const response = await request.post(`${appConfig.apiBaseUrl}/accounts`, {
        data: scenario.account
      });
      expect(response.ok()).toBeTruthy();
      expect(await response.json()).toMatchObject({
        accountId: scenario.account.accountId,
        customerId: scenario.customer.customerId,
        balance: scenario.account.initialDeposit
      });
    });

    await stepLogger.run("Post a transaction through the API", async () => {
      const response = await request.post(`${appConfig.apiBaseUrl}/transactions`, {
        data: scenario.transaction
      });
      expect(response.ok()).toBeTruthy();

      const payload = await response.json();
      expect(payload.account.balance).toBe(scenario.expectedBalance);
    });

    await stepLogger.run("Validate persisted customer and account state", async () => {
      const customersResponse = await request.get(`${appConfig.apiBaseUrl}/customers`);
      const accountsResponse = await request.get(`${appConfig.apiBaseUrl}/accounts`);

      expect(customersResponse.ok()).toBeTruthy();
      expect(accountsResponse.ok()).toBeTruthy();

      const customers = await customersResponse.json();
      const accounts = await accountsResponse.json();

      expect(customers).toContainEqual(expect.objectContaining({ customerId: scenario.customer.customerId }));
      expect(accounts).toContainEqual(
        expect.objectContaining({
          accountId: scenario.account.accountId,
          balance: scenario.expectedBalance
        })
      );
    });
  });
});
