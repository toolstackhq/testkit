#!/usr/bin/env node

import process from "node:process";
import path from "node:path";
import { spawn } from "node:child_process";

import dotenv from "dotenv";

const mode = process.argv[2] ?? "run";
const args = process.argv.slice(3);
const cwd = process.cwd();
const healthUrl = "http://127.0.0.1:3000/health";
const environment = process.env.TEST_ENV ?? "dev";
const environmentDefaults = {
  dev: "http://127.0.0.1:3000",
  staging: "https://staging-ui.example.internal",
  prod: "https://ui.example.internal"
};

dotenv.config({ path: path.resolve(cwd, ".env") });
dotenv.config({ path: path.resolve(cwd, `.env.${environment}`), override: true });

const uiBaseUrl =
  process.env[`${environment.toUpperCase()}_UI_BASE_URL`] ??
  process.env.UI_BASE_URL ??
  environmentDefaults[environment] ??
  environmentDefaults.dev;

const shouldAutoStartDemoApp =
  environment === "dev" &&
  uiBaseUrl === environmentDefaults.dev &&
  process.env.CY_DISABLE_LOCAL_DEMO_APP !== "true";

function getCommandName(command) {
  return process.platform === "win32" ? `${command}.cmd` : command;
}

function spawnCommand(command, commandArgs, options = {}) {
  return spawn(getCommandName(command), commandArgs, {
    cwd,
    stdio: "inherit",
    ...options
  });
}

async function waitForHealthcheck(url, timeoutMs = 30_000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      const response = await globalThis.fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Service is not ready yet.
    }

    await new Promise((resolve) => globalThis.setTimeout(resolve, 500));
  }

  throw new Error(`Timed out waiting for ${url}`);
}

function killChild(child) {
  if (!child || child.killed) {
    return;
  }

  child.kill("SIGTERM");
}

async function run() {
  let demoAppProcess;

  try {
    if (shouldAutoStartDemoApp) {
      demoAppProcess = spawnCommand("npm", ["run", "demo:ui"]);
      await waitForHealthcheck(healthUrl);
    }

    const cypressCommand = mode === "open" ? "open" : "run";
    const cypressProcess = spawnCommand("npx", ["cypress", cypressCommand, ...args]);

    const exitCode = await new Promise((resolve) => {
      cypressProcess.on("close", resolve);
      cypressProcess.on("error", () => resolve(1));
    });

    if (exitCode !== 0) {
      process.exit(Number(exitCode) || 1);
    }
  } finally {
    killChild(demoAppProcess);
  }
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => process.exit(1));
}

run().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
