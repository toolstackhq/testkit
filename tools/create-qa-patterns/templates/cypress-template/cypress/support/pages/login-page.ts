export const loginPage = {
  visit(): Cypress.Chainable {
    return cy.visit("/login");
  },

  usernameInput(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get("#username");
  },

  passwordInput(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get("#password");
  },

  submitButton(): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.contains("button", "Sign in");
  },

  login(username: string, password: string): void {
    this.usernameInput().clear().type(username);
    this.passwordInput().clear().type(password, { log: false });
    this.submitButton().click();
  }
};
