import type { TestEnvironment } from "./test-env";

type EnvironmentDefaults = {
  uiBaseUrl: string;
  credentials: {
    username: string;
    password: string;
  };
};

const DEFAULTS: Record<TestEnvironment, EnvironmentDefaults> = {
  dev: {
    uiBaseUrl: "http://127.0.0.1:3000",
    credentials: {
      username: "tester",
      password: "Password123!"
    }
  },
  staging: {
    uiBaseUrl: "https://staging-ui.example.internal",
    credentials: {
      username: "staging-user",
      password: "replace-me"
    }
  },
  prod: {
    uiBaseUrl: "https://ui.example.internal",
    credentials: {
      username: "prod-user",
      password: "replace-me"
    }
  }
};

export function getEnvironmentDefaults(testEnv: TestEnvironment): EnvironmentDefaults {
  return DEFAULTS[testEnv];
}
