export type TestEnvironment = "dev" | "staging" | "prod";

const testEnvironmentValues = new Set<TestEnvironment>(["dev", "staging", "prod"]);

export function loadTestEnvironment(): TestEnvironment {
  const testEnv = process.env.TEST_ENV ?? "dev";

  if (!testEnvironmentValues.has(testEnv as TestEnvironment)) {
    throw new Error(`Unsupported TEST_ENV "${testEnv}". Expected one of: dev, staging, prod.`);
  }

  return testEnv as TestEnvironment;
}
