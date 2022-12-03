const generateRandomString = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

//Checks if email exists against database 
const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      const result = database[user];
      return result;
    }
    return null;
  }
};

//Only logged in users can see their created URLs
const urlForUser = (id, urlDatabase) => {
  let userURL = {};
  for (const key in urlDatabase) {
    if (id === urlDatabase[key].userID) {
      userURL[key] = urlDatabase[key];
    }
  }
  return userURL;
};

module.exports = { generateRandomString, getUserByEmail, urlForUser };