const express = require("express");

const { createAccount, createCustomer, createTransaction, state } = require("./store");

const app = express();
const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || "3001");

app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.get("/customers", (_request, response) => {
  response.json(state.customers);
});

app.post("/customers", (request, response) => {
  const { firstName, lastName, email } = request.body;
  if (!firstName || !lastName || !email) {
    response.status(400).json({ error: "firstName, lastName, and email are required" });
    return;
  }

  try {
    const customer = createCustomer(request.body);
    response.status(201).json(customer);
  } catch (error) {
    response.status(409).json({ error: error.message });
  }
});

app.get("/accounts", (_request, response) => {
  response.json(state.accounts);
});

app.post("/accounts", (request, response) => {
  const { customerId } = request.body;
  if (!customerId) {
    response.status(400).json({ error: "customerId is required" });
    return;
  }

  try {
    const account = createAccount(request.body);
    response.status(201).json(account);
  } catch (error) {
    const status = error.message.includes("not found") ? 404 : 409;
    response.status(status).json({ error: error.message });
  }
});

app.post("/transactions", (request, response) => {
  const { accountId, amount, description } = request.body;
  if (!accountId || !amount || !description) {
    response.status(400).json({ error: "accountId, amount, and description are required" });
    return;
  }

  try {
    const result = createTransaction(request.body);
    response.status(201).json(result);
  } catch (error) {
    response.status(404).json({ error: error.message });
  }
});

app.listen(port, host, () => {
  console.log(`API demo server listening on http://${host}:${port}`);
});
