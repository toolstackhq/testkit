import type { PersonRecord } from "./data/data-factory";
import { loginPage } from "./pages/login-page";
import { peoplePage } from "./pages/people-page";

Cypress.Commands.add("getByTestId", (testId: string) => {
  return cy.get(`[data-testid='${testId}']`);
});

Cypress.Commands.add("signIn", (username: string, password: string) => {
  loginPage.visit();
  loginPage.login(username, password);
  peoplePage.heading().should("be.visible");
});

Cypress.Commands.add("addPerson", (person: PersonRecord) => {
  peoplePage.addPerson(person);
});
