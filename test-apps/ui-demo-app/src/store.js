const state = {
  credentials: {
    username: process.env.UI_DEMO_USERNAME || "tester",
    password: process.env.UI_DEMO_PASSWORD || "Password123!"
  },
  people: []
};

function findPerson(personId) {
  return state.people.find((person) => person.personId === personId);
}

function createPerson(person) {
  if (findPerson(person.personId)) {
    throw new Error(`Person ${person.personId} already exists`);
  }

  state.people.push({
    personId: person.personId,
    name: person.name,
    role: person.role,
    email: person.email
  });
}

function getPeople(search = "") {
  const query = String(search).trim().toLowerCase();
  if (!query) {
    return state.people;
  }

  return state.people.filter((person) => {
    return [person.name, person.role, person.email].some((value) =>
      value.toLowerCase().includes(query)
    );
  });
}

module.exports = {
  state,
  createPerson,
  getPeople
};
