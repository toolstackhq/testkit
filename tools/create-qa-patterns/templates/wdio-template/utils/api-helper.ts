// Pre-configured REST client instance for API testing.
// WebdriverIO runs in Node, so the client can be used directly in specs.
import { createRestClient } from './api-client';
import { loadRuntimeConfig } from '../config/runtime-config';

const config = loadRuntimeConfig();

export const apiClient = createRestClient({
  baseUrl: config.apiBaseUrl
});
