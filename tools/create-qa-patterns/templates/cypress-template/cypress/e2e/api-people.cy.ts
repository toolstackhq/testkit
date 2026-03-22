// Starter API journey that pairs with the deterministic demo API server.
// Uses cy.task('apiRequest', ...) so the REST client runs in Node context.

interface ApiResponse {
  ok: boolean;
  status: number;
  data: unknown;
}

describe('API starter flow', () => {
  it('create and list one person', () => {
    const person = {
      personId: `person-cy-${Date.now()}`,
      name: 'Jane Doe',
      role: 'QA Engineer',
      email: 'jane@example.com'
    };

    cy.task<ApiResponse>('apiRequest', {
      method: 'post',
      path: '/people',
      options: { body: person }
    }).then((response) => {
      expect(response.ok).to.equal(true);
      expect(response.status).to.equal(201);
      expect(response.data).to.deep.include({ name: person.name });
    });

    cy.task<ApiResponse>('apiRequest', {
      method: 'get',
      path: '/people'
    }).then((response) => {
      expect(response.ok).to.equal(true);
      const people = response.data as Record<string, unknown>[];
      const found = people.find((p) => p.personId === person.personId);
      expect(found).to.not.equal(undefined);
    });
  });
});
