// Reads runtime values from Cypress env so specs stay clean and framework-aware.
type Credentials = {
  username: string;
  password: string;
};

export type AppConfig = {
  testEnv: string;
  testRunId: string;
  credentials: Credentials;
};

export function loadAppConfig(): AppConfig {
  const credentials = Cypress.env("credentials") as Credentials | undefined;

  return {
    testEnv: String(Cypress.env("testEnv") ?? "dev"),
    testRunId: String(Cypress.env("testRunId") ?? "local"),
    credentials: {
      username: credentials?.username ?? "tester",
      password: credentials?.password ?? "Password123!"
    }
  };
}
