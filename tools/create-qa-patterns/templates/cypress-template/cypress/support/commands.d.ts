/// <reference types="cypress" />

import type { PersonRecord } from "./data/data-factory";

declare global {
  namespace Cypress {
    interface Chainable {
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
      signIn(username: string, password: string): Chainable<void>;
      addPerson(person: PersonRecord): Chainable<void>;
    }
  }
}

export {};
