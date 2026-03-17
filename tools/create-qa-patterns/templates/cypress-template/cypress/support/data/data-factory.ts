import { createSeededFaker } from "./seeded-faker";
import { IdGenerator } from "./id-generator";

export type PersonRecord = {
  personId: string;
  name: string;
  role: string;
  email: string;
};

export class DataFactory {
  private readonly idGenerator: IdGenerator;

  constructor(private readonly testRunId: string) {
    this.idGenerator = new IdGenerator(testRunId);
  }

  person(overrides?: Partial<PersonRecord>): PersonRecord {
    const personId = overrides?.personId ?? this.idGenerator.next("person");
    const seededFaker = createSeededFaker(`${this.testRunId}:${personId}`);
    const firstName = seededFaker.person.firstName();
    const lastName = seededFaker.person.lastName();
    const name = `${firstName} ${lastName}`;

    return {
      personId,
      name,
      role: overrides?.role ?? seededFaker.person.jobTitle(),
      email: overrides?.email ?? `${firstName}.${lastName}.${personId}@example.test`.toLowerCase(),
      ...overrides
    };
  }
}
