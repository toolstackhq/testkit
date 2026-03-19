// Starter API journey that pairs with the deterministic demo API server.
import { apiClient } from '../utils/api-helper';

describe('API starter flow', () => {
  it('create and list one person', async () => {
    const person = {
      personId: `person-wdio-${Date.now()}`,
      name: 'Jane Doe',
      role: 'QA Engineer',
      email: 'jane@example.com'
    };

    const createRes = await apiClient.post<Record<string, unknown>>(
      '/people',
      { body: person }
    );
    expect(createRes.ok).toBe(true);
    expect(createRes.status).toBe(201);
    expect(createRes.data).toMatchObject({ name: person.name });

    const listRes = await apiClient.get<Record<string, unknown>[]>('/people');
    expect(listRes.ok).toBe(true);
    const found = listRes.data.find(
      (p: any) => p.personId === person.personId
    );
    expect(found).toBeDefined();
    expect((found as any).name).toBe(person.name);
  });
});
