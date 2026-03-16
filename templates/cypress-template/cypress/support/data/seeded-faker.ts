import { Faker, en } from "@faker-js/faker";

function toNumericSeed(seed: string): number {
  return seed.split("").reduce((accumulator, character) => accumulator + character.charCodeAt(0), 0);
}

export function createSeededFaker(seed: string): Faker {
  const faker = new Faker({ locale: [en] });
  faker.seed(toNumericSeed(seed));
  return faker;
}
