const state = {
  credentials: {
    username: process.env.UI_DEMO_USERNAME || "tester",
    password: process.env.UI_DEMO_PASSWORD || "Password123!"
  },
  customers: [],
  accounts: [],
  transactions: []
};

function findCustomer(customerId) {
  return state.customers.find((customer) => customer.customerId === customerId);
}

function findAccount(accountId) {
  return state.accounts.find((account) => account.accountId === accountId);
}

function createCustomer(customer) {
  if (findCustomer(customer.customerId)) {
    throw new Error(`Customer ${customer.customerId} already exists`);
  }

  state.customers.push({
    customerId: customer.customerId,
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email
  });
}

function createAccount(account) {
  if (!findCustomer(account.customerId)) {
    throw new Error(`Customer ${account.customerId} was not found`);
  }

  if (findAccount(account.accountId)) {
    throw new Error(`Account ${account.accountId} already exists`);
  }

  state.accounts.push({
    accountId: account.accountId,
    customerId: account.customerId,
    accountType: account.accountType,
    balance: Number(account.initialDeposit)
  });
}

function postTransaction(transaction) {
  const account = findAccount(transaction.accountId);
  if (!account) {
    throw new Error(`Account ${transaction.accountId} was not found`);
  }

  const amount = Number(transaction.amount);
  account.balance += amount;

  state.transactions.push({
    transactionId: transaction.transactionId,
    accountId: transaction.accountId,
    transactionType: "Deposit",
    amount,
    description: transaction.description
  });
}

function getMetrics() {
  return {
    customers: state.customers.length,
    accounts: state.accounts.length,
    transactions: state.transactions.length
  };
}

module.exports = {
  state,
  createCustomer,
  createAccount,
  postTransaction,
  getMetrics
};
