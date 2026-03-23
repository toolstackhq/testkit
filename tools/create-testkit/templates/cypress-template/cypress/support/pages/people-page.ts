// Page module for the people screen used in the starter Cypress journey.
import type { PersonRecord } from '../data/data-factory';

export const peoplePage = {
  heading(): Cypress.Chainable {
    return cy.contains('h1', 'People');
  },

  welcomeMessage(): Cypress.Chainable {
    return cy.get("[data-testid='welcome-message']");
  },

  flashMessage(): Cypress.Chainable {
    return cy.get("[data-testid='flash-message']");
  },

  personIdInput(): Cypress.Chainable {
    return cy.get('#personId');
  },

  nameInput(): Cypress.Chainable {
    return cy.get('#name');
  },

  roleInput(): Cypress.Chainable {
    return cy.get('#role');
  },

  emailInput(): Cypress.Chainable {
    return cy.get('#email');
  },

  submitButton(): Cypress.Chainable {
    return cy.contains('button', 'Add person');
  },

  personRow(personId: string): Cypress.Chainable {
    return cy.get(`[data-testid='person-row-${personId}']`);
  },

  nameCell(personId: string): Cypress.Chainable {
    return this.personRow(personId).find('td').eq(0);
  },

  roleCell(personId: string): Cypress.Chainable {
    return this.personRow(personId).find('td').eq(1);
  },

  emailCell(personId: string): Cypress.Chainable {
    return this.personRow(personId).find('td').eq(2);
  },

  addPerson(person: PersonRecord): void {
    this.personIdInput().clear().type(person.personId);
    this.nameInput().clear().type(person.name);
    this.roleInput().clear().type(person.role);
    this.emailInput().clear().type(person.email);
    this.submitButton().click();
  }
};
