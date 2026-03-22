// Starter API journey that pairs with the deterministic demo API server.
import { expect, test } from '../fixtures/test-fixtures';

test.describe('API starter flow', () => {
  test('create and list one person @regression', async ({
    apiClient,
    dataFactory,
    stepLogger
  }) => {
    const person = dataFactory.person();

    await stepLogger.run('Create one person through the API', async () => {
      const response = await apiClient.post<Record<string, unknown>>(
        '/people',
        { body: person }
      );
      expect(response.ok).toBeTruthy();
      expect(response.data).toMatchObject(person);
    });

    await stepLogger.run('List people and verify the new record', async () => {
      const response =
        await apiClient.get<Record<string, unknown>[]>('/people');
      expect(response.ok).toBeTruthy();
      expect(response.data).toContainEqual(
        expect.objectContaining({ personId: person.personId })
      );
    });
  });
});
