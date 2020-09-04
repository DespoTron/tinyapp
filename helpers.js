const getUserByEmail = (database, email) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};

// Generate a string of 6 random alphanumeric characters
const generateRandomString = () => {
  return Math.random().toString(20).substr(2, 6);
};

const urlsForUser = (id, urlDatabase) => {
  const userURLDatabase = {};  
  for (const url in urlDatabase) {
    if(urlDatabase[url].userID === id) {
      userURLDatabase[url] = urlDatabase[url];
    }
  }
  return userURLDatabase;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser };