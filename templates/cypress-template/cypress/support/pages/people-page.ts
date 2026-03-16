import type { PersonRecord } from "../data/data-factory";

export const peoplePage = {
  heading(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.contains("h1", "People");
  },

  welcomeMessage(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get("[data-testid='welcome-message']");
  },

  flashMessage(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get("[data-testid='flash-message']");
  },

  personIdInput(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get("#personId");
  },

  nameInput(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get("#name");
  },

  roleInput(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get("#role");
  },

  emailInput(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get("#email");
  },

  submitButton(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.contains("button", "Add person");
  },

  personRow(personId: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(`[data-testid='person-row-${personId}']`);
  },

  nameCell(personId: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.personRow(personId).find("td").eq(0);
  },

  roleCell(personId: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.personRow(personId).find("td").eq(1);
  },

  emailCell(personId: string): Cypress.Chainable<JQuery<HTMLElement>> {
    return this.personRow(personId).find("td").eq(2);
  },

  addPerson(person: PersonRecord): void {
    this.personIdInput().clear().type(person.personId);
    this.nameInput().clear().type(person.name);
    this.roleInput().clear().type(person.role);
    this.emailInput().clear().type(person.email);
    this.submitButton().click();
  }
};
