const state = {
  customers: [],
  accounts: [],
  transactions: [],
  counters: {
    customer: 0,
    account: 0,
    transaction: 0
  }
};

function nextId(type, prefix) {
  state.counters[type] += 1;
  return `${prefix}-${String(state.counters[type]).padStart(4, "0")}`;
}

function getCustomer(customerId) {
  return state.customers.find((customer) => customer.customerId === customerId);
}

function getAccount(accountId) {
  return state.accounts.find((account) => account.accountId === accountId);
}

function createCustomer(payload) {
  const customerId = payload.customerId || nextId("customer", "cust");
  if (getCustomer(customerId)) {
    throw new Error(`Customer ${customerId} already exists`);
  }

  const customer = {
    customerId,
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email
  };

  state.customers.push(customer);
  return customer;
}

function createAccount(payload) {
  if (!getCustomer(payload.customerId)) {
    throw new Error(`Customer ${payload.customerId} was not found`);
  }

  const accountId = payload.accountId || nextId("account", "acct");
  if (getAccount(accountId)) {
    throw new Error(`Account ${accountId} already exists`);
  }

  const account = {
    accountId,
    customerId: payload.customerId,
    accountType: payload.accountType || "Checking",
    balance: Number(payload.initialDeposit || 0)
  };

  state.accounts.push(account);
  return account;
}

function createTransaction(payload) {
  const account = getAccount(payload.accountId);
  if (!account) {
    throw new Error(`Account ${payload.accountId} was not found`);
  }

  const transaction = {
    transactionId: payload.transactionId || nextId("transaction", "txn"),
    accountId: payload.accountId,
    transactionType: payload.transactionType || "Deposit",
    amount: Number(payload.amount),
    description: payload.description
  };

  account.balance += transaction.amount;
  state.transactions.push(transaction);
  return {
    transaction,
    account
  };
}

module.exports = {
  state,
  createCustomer,
  createAccount,
  createTransaction
};
