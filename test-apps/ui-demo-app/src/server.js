const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const querystring = require("node:querystring");

const { createAccount, createCustomer, getMetrics, postTransaction, state } = require("./store");
const {
  accountsPage,
  customersPage,
  dashboardPage,
  layout,
  loginPage,
  transactionsPage
} = require("./templates");

const host = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || "3000");

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk.toString();
    });
    request.on("end", () => resolve(querystring.parse(body)));
    request.on("error", reject);
  });
}

function parseCookies(request) {
  const header = request.headers.cookie;
  if (!header) {
    return {};
  }

  return header.split(";").reduce((cookies, entry) => {
    const [key, value] = entry.trim().split("=");
    cookies[key] = value;
    return cookies;
  }, {});
}

function redirect(response, location) {
  response.writeHead(302, { Location: location });
  response.end();
}

function sendHtml(response, html) {
  response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
  response.end(html);
}

function sendJson(response, payload) {
  response.writeHead(200, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload));
}

function isAuthenticated(request) {
  return parseCookies(request).session === "authenticated";
}

function pageMessage(url) {
  return new URL(url, "http://127.0.0.1").searchParams.get("message") || "";
}

function protectedRoute(request, response) {
  if (!isAuthenticated(request)) {
    redirect(response, "/login");
    return false;
  }

  return true;
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, "http://127.0.0.1");

  if (request.method === "GET" && url.pathname === "/styles.css") {
    const cssPath = path.join(__dirname, "..", "public", "styles.css");
    response.writeHead(200, { "Content-Type": "text/css; charset=utf-8" });
    response.end(fs.readFileSync(cssPath, "utf8"));
    return;
  }

  if (request.method === "GET" && url.pathname === "/health") {
    sendJson(response, { status: "ok", metrics: getMetrics() });
    return;
  }

  if (request.method === "GET" && url.pathname === "/") {
    redirect(response, "/login");
    return;
  }

  if (request.method === "GET" && url.pathname === "/login") {
    sendHtml(response, loginPage());
    return;
  }

  if (request.method === "POST" && url.pathname === "/login") {
    const body = await readBody(request);
    if (
      body.username === state.credentials.username &&
      body.password === state.credentials.password
    ) {
      response.writeHead(302, {
        Location: "/dashboard",
        "Set-Cookie": "session=authenticated; HttpOnly; Path=/; SameSite=Lax"
      });
      response.end();
      return;
    }

    sendHtml(response, loginPage("Invalid credentials"));
    return;
  }

  if (request.method === "GET" && url.pathname === "/dashboard") {
    if (!protectedRoute(request, response)) {
      return;
    }

    sendHtml(
      response,
      layout({
        title: "Dashboard",
        body: dashboardPage(getMetrics()),
        flashMessage: pageMessage(request.url),
        username: state.credentials.username
      })
    );
    return;
  }

  if (request.method === "GET" && url.pathname === "/customers") {
    if (!protectedRoute(request, response)) {
      return;
    }

    sendHtml(
      response,
      layout({
        title: "Customers",
        body: customersPage(state.customers),
        flashMessage: pageMessage(request.url),
        username: state.credentials.username
      })
    );
    return;
  }

  if (request.method === "POST" && url.pathname === "/customers") {
    if (!protectedRoute(request, response)) {
      return;
    }

    try {
      const body = await readBody(request);
      createCustomer(body);
      redirect(response, "/customers?message=Customer%20created");
    } catch (error) {
      redirect(response, `/customers?message=${encodeURIComponent(error.message)}`);
    }
    return;
  }

  if (request.method === "GET" && url.pathname === "/accounts") {
    if (!protectedRoute(request, response)) {
      return;
    }

    sendHtml(
      response,
      layout({
        title: "Accounts",
        body: accountsPage(state.accounts),
        flashMessage: pageMessage(request.url),
        username: state.credentials.username
      })
    );
    return;
  }

  if (request.method === "POST" && url.pathname === "/accounts") {
    if (!protectedRoute(request, response)) {
      return;
    }

    try {
      const body = await readBody(request);
      createAccount(body);
      redirect(response, "/accounts?message=Account%20opened");
    } catch (error) {
      redirect(response, `/accounts?message=${encodeURIComponent(error.message)}`);
    }
    return;
  }

  if (request.method === "GET" && url.pathname === "/transactions") {
    if (!protectedRoute(request, response)) {
      return;
    }

    sendHtml(
      response,
      layout({
        title: "Transactions",
        body: transactionsPage(state.transactions),
        flashMessage: pageMessage(request.url),
        username: state.credentials.username
      })
    );
    return;
  }

  if (request.method === "POST" && url.pathname === "/transactions") {
    if (!protectedRoute(request, response)) {
      return;
    }

    try {
      const body = await readBody(request);
      postTransaction(body);
      redirect(response, "/transactions?message=Deposit%20posted");
    } catch (error) {
      redirect(response, `/transactions?message=${encodeURIComponent(error.message)}`);
    }
    return;
  }

  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("Not found");
});

server.listen(port, host, () => {
  console.log(`UI demo app listening on http://${host}:${port}`);
});
