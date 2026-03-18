// Registers the custom Cypress commands that the starter specs rely on.
import type { PersonRecord } from './data/data-factory';
import { loginPage } from './pages/login-page';
import { peoplePage } from './pages/people-page';

declare global {
  namespace Cypress {
    interface Chainable {
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
      signIn(username: string, password: string): Chainable<void>;
      addPerson(person: PersonRecord): Chainable<void>;
    }
  }
}

Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid='${testId}']`);
});

Cypress.Commands.add('signIn', (username: string, password: string) => {
  loginPage.visit();
  loginPage.login(username, password);
  peoplePage.heading().should('be.visible');
});

Cypress.Commands.add('addPerson', (person: PersonRecord) => {
  peoplePage.addPerson(person);
});

export {};
