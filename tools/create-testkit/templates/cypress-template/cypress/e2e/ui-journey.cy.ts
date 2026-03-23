// Starter Cypress scenario that demonstrates the preferred spec style for this template.
import { DataFactory } from '../support/data/data-factory';
import { loadAppConfig } from '../support/app-config';
import { peoplePage } from '../support/pages/people-page';

describe('UI starter journey', () => {
  it('signs in and adds one person', () => {
    const appConfig = loadAppConfig();
    const dataFactory = new DataFactory(appConfig.testRunId);
    const person = dataFactory.person();

    cy.signIn(appConfig.credentials.username, appConfig.credentials.password);
    peoplePage
      .welcomeMessage()
      .should('contain', appConfig.credentials.username);

    cy.addPerson(person);
    peoplePage.flashMessage().should('contain', 'Person added');
    peoplePage.nameCell(person.personId).should('have.text', person.name);
    peoplePage.roleCell(person.personId).should('have.text', person.role);
    peoplePage.emailCell(person.personId).should('have.text', person.email);
  });
});
