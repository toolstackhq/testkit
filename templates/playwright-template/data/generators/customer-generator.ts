import type { Customer } from "../schemas/domain-schemas";

import { createSeededFaker } from "./seeded-faker";

export function generateCustomerProfile(seedInput: string, customerId: string): Omit<Customer, "customerId"> {
  const seededFaker = createSeededFaker(seedInput);
  const firstName = seededFaker.person.firstName();
  const lastName = seededFaker.person.lastName();
  const email = `${firstName}.${lastName}.${customerId}@example.test`.toLowerCase();

  return {
    firstName,
    lastName,
    email
  };
}
