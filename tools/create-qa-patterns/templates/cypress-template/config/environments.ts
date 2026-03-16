import type { TestEnvironment } from "./test-env";

type EnvironmentDefaults = {
  uiBaseUrl: string;
  credentials: {
    username: string;
    password: string;
  };
};

const environmentDefaults: Record<TestEnvironment, EnvironmentDefaults> = {
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
      password: "staging-password"
    }
  },
  prod: {
    uiBaseUrl: "https://ui.example.internal",
    credentials: {
      username: "prod-user",
      password: "prod-password"
    }
  }
};

export function getEnvironmentDefaults(environment: TestEnvironment): EnvironmentDefaults {
  return environmentDefaults[environment];
}
