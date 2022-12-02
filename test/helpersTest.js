const { assert } = require('chai');

const { generateRandomString, getUserByEmail, urlForUser } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "k3J2Le",
  },
};

//console.log(getUserByEmail("user@example.com", testUsers))
describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = testUsers.userRandomID;
    assert.equal(user, expectedUserID);
  });

  it('should return null if email is not in our database', () => {
    const user = getUserByEmail("test@example.com", testUsers);
    const expectedOutcome = null;
    assert.equal(user, expectedOutcome);
  });
});

describe('generateRandomString', function () {
  it('should return a random 6 character string', function () {
    const id = generateRandomString();
    const length = 6;
    assert.equal(id.length, 6);
  });
});

describe('urlForUser', function () {
  it('should return the URL where the userID equals the id of current user', function () {
    const userURLs = urlForUser('aJ48lW', urlDatabase);
    const expectedOutcome = { "b6UTxQ": { longURL: "https://www.tsn.ca", userID: "aJ48lW" } };
    assert.deepEqual(userURLs, expectedOutcome);
  });

  it('should return an empty object if user is not registered in database', function () {
    const userURLs = urlForUser('kDj3p5', urlDatabase);
    const expectedOutcome = {};
    assert.deepEqual(userURLs, expectedOutcome);
  });
});