// Registers cy.task('apiRequest', ...) so REST client calls run in Node context.
import { createRestClient, type RestClient } from '../../utils/api-client';
import { loadRuntimeConfig } from '../../config/runtime-config';

let client: RestClient | null = null;

function getClient(): RestClient {
  if (!client) {
    const config = loadRuntimeConfig();
    client = createRestClient({ baseUrl: config.apiBaseUrl });
  }
  return client;
}

interface ApiRequestPayload {
  method: 'get' | 'post' | 'put' | 'patch' | 'delete';
  path: string;
  options?: {
    body?: unknown;
    headers?: Record<string, string>;
    params?: Record<string, string>;
    query?: Record<string, string | number | boolean>;
  };
}

export function registerApiTasks(
  on: Cypress.PluginEvents
): void {
  on('task', {
    async apiRequest(payload: ApiRequestPayload) {
      const api = getClient();
      const response = await api[payload.method](payload.path, payload.options);
      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data,
        ok: response.ok,
        elapsed: response.elapsed
      };
    }
  });
}
