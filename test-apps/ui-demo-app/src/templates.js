function layout({ title, body, flashMessage = "", username = "tester" }) {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${title}</title>
      <link rel="stylesheet" href="/styles.css" />
    </head>
    <body>
      <div class="layout">
        <header class="header">
          <div class="brand">Bank Demo Console</div>
          <nav class="nav" aria-label="Primary">
            <a href="/dashboard">Dashboard</a>
            <a href="/customers">Customers</a>
            <a href="/accounts">Accounts</a>
            <a href="/transactions">Transactions</a>
          </nav>
        </header>
        ${flashMessage ? `<div class="flash-message" data-testid="flash-message" role="status">${flashMessage}</div>` : ""}
        <p data-testid="welcome-message">Signed in as ${username}</p>
        ${body}
      </div>
    </body>
  </html>`;
}

function loginPage(errorMessage = "") {
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Login</title>
      <link rel="stylesheet" href="/styles.css" />
    </head>
    <body>
      <main class="login-shell">
        <section class="card login-card">
          <h1>Login</h1>
          ${errorMessage ? `<div class="flash-message" role="status">${errorMessage}</div>` : ""}
          <form action="/login" method="post">
            <label for="username">
              Username
              <input id="username" name="username" type="text" autocomplete="username" required />
            </label>
            <label for="password">
              Password
              <input id="password" name="password" type="password" autocomplete="current-password" required />
            </label>
            <button type="submit">Sign in</button>
          </form>
        </section>
      </main>
    </body>
  </html>`;
}

function dashboardPage(metrics) {
  return `
    <section class="panel">
      <h1>Dashboard</h1>
      <div class="card-grid">
        <article class="card">
          <h2>Customers</h2>
          <p data-testid="metric-customers">${metrics.customers}</p>
        </article>
        <article class="card">
          <h2>Accounts</h2>
          <p data-testid="metric-accounts">${metrics.accounts}</p>
        </article>
        <article class="card">
          <h2>Transactions</h2>
          <p data-testid="metric-transactions">${metrics.transactions}</p>
        </article>
      </div>
    </section>
  `;
}

function customersPage(customers) {
  const rows = customers
    .map((customer) => {
      return `<tr data-testid="customer-row-${customer.customerId}">
        <td>${customer.customerId}</td>
        <td>${customer.firstName} ${customer.lastName}</td>
        <td>${customer.email}</td>
      </tr>`;
    })
    .join("");

  return `
    <section class="panel-grid">
      <section class="panel">
        <h1>Customers</h1>
        <form action="/customers" method="post">
          <label for="customerId">
            Customer ID
            <input id="customerId" name="customerId" type="text" required />
          </label>
          <label for="firstName">
            First Name
            <input id="firstName" name="firstName" type="text" required />
          </label>
          <label for="lastName">
            Last Name
            <input id="lastName" name="lastName" type="text" required />
          </label>
          <label for="email">
            Email
            <input id="email" name="email" type="email" required />
          </label>
          <button type="submit">Create customer</button>
        </form>
      </section>
      <section class="panel">
        <h2>Customer Directory</h2>
        <table>
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </section>
    </section>
  `;
}

function accountsPage(accounts) {
  const rows = accounts
    .map((account) => {
      return `<tr data-testid="account-row-${account.accountId}">
        <td>${account.accountId}</td>
        <td>${account.customerId}</td>
        <td>${account.accountType}</td>
        <td>$${account.balance.toFixed(2)}</td>
      </tr>`;
    })
    .join("");

  return `
    <section class="panel-grid">
      <section class="panel">
        <h1>Accounts</h1>
        <form action="/accounts" method="post">
          <label for="accountId">
            Account ID
            <input id="accountId" name="accountId" type="text" required />
          </label>
          <label for="customerId">
            Customer ID
            <input id="customerId" name="customerId" type="text" required />
          </label>
          <label for="accountType">
            Account Type
            <select id="accountType" name="accountType">
              <option>Checking</option>
              <option>Savings</option>
            </select>
          </label>
          <label for="initialDeposit">
            Opening Balance
            <input id="initialDeposit" name="initialDeposit" type="number" min="0" step="0.01" required />
          </label>
          <button type="submit">Open account</button>
        </form>
      </section>
      <section class="panel">
        <h2>Account Ledger</h2>
        <table>
          <thead>
            <tr>
              <th>Account ID</th>
              <th>Customer ID</th>
              <th>Type</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </section>
    </section>
  `;
}

function transactionsPage(transactions) {
  const rows = transactions
    .map((transaction) => {
      return `<tr data-testid="transaction-row-${transaction.transactionId}">
        <td>${transaction.transactionId}</td>
        <td>${transaction.accountId}</td>
        <td>${transaction.transactionType}</td>
        <td>${transaction.description}</td>
        <td>$${transaction.amount.toFixed(2)}</td>
      </tr>`;
    })
    .join("");

  return `
    <section class="panel-grid">
      <section class="panel">
        <h1>Transactions</h1>
        <form action="/transactions" method="post">
          <label for="transactionId">
            Transaction ID
            <input id="transactionId" name="transactionId" type="text" required />
          </label>
          <label for="accountId">
            Account ID
            <input id="accountId" name="accountId" type="text" required />
          </label>
          <label for="amount">
            Amount
            <input id="amount" name="amount" type="number" min="0.01" step="0.01" required />
          </label>
          <label for="description">
            Description
            <input id="description" name="description" type="text" required />
          </label>
          <button type="submit">Post deposit</button>
        </form>
      </section>
      <section class="panel">
        <h2>Recent Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Transaction ID</th>
              <th>Account ID</th>
              <th>Type</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </section>
    </section>
  `;
}

module.exports = {
  layout,
  loginPage,
  dashboardPage,
  customersPage,
  accountsPage,
  transactionsPage
};
