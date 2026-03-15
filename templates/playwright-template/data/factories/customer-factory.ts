import {
  accountSchema,
  customerOnboardingScenarioSchema,
  customerSchema,
  transactionSchema,
  type Account,
  type Customer,
  type CustomerOnboardingScenario,
  type Transaction
} from "../schemas/domain-schemas";
import { generateCustomerProfile } from "../generators/customer-generator";
import { IdGenerator } from "../generators/id-generator";

export class CustomerFactory {
  private readonly idGenerator: IdGenerator;

  constructor(private readonly testRunId: string) {
    this.idGenerator = new IdGenerator(testRunId);
  }

  createCustomer(overrides?: Partial<Customer>): Customer {
    const customerId = overrides?.customerId ?? this.idGenerator.next("cust");
    const generatedProfile = generateCustomerProfile(`${this.testRunId}:${customerId}`, customerId);

    return customerSchema.parse({
      customerId,
      ...generatedProfile,
      ...overrides
    });
  }

  createAccount(customer: Customer, overrides?: Partial<Account>): Account {
    return accountSchema.parse({
      accountId: overrides?.accountId ?? this.idGenerator.next("acct"),
      customerId: customer.customerId,
      accountType: "Checking",
      initialDeposit: 250,
      ...overrides
    });
  }

  createDeposit(account: Account, overrides?: Partial<Transaction>): Transaction {
    return transactionSchema.parse({
      transactionId: overrides?.transactionId ?? this.idGenerator.next("txn"),
      accountId: account.accountId,
      transactionType: "Deposit",
      amount: 125,
      description: "Initial deposit",
      ...overrides
    });
  }

  createCustomerOnboardingScenario(): CustomerOnboardingScenario {
    const customer = this.createCustomer();
    const account = this.createAccount(customer);
    const transaction = this.createDeposit(account);

    return customerOnboardingScenarioSchema.parse({
      customer,
      account,
      transaction,
      expectedBalance: account.initialDeposit + transaction.amount
    });
  }
}
