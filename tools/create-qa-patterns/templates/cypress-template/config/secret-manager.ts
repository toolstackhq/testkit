import type { TestEnvironment } from "./test-env";

export interface SecretProvider {
  getOptionalSecret(secretName: string, environment: TestEnvironment): string | undefined;
}

export class EnvSecretProvider implements SecretProvider {
  getOptionalSecret(secretName: string, environment: TestEnvironment): string | undefined {
    return process.env[`${environment.toUpperCase()}_${secretName}`] ?? process.env[secretName];
  }
}

export class SecretManager {
  constructor(private readonly secretProvider: SecretProvider) {}

  getOptionalSecret(secretName: string, environment: TestEnvironment): string | undefined {
    return this.secretProvider.getOptionalSecret(secretName, environment);
  }
}
