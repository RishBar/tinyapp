let lookUpEmail = function(email, users) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return undefined;
};

const urlsForUser = function(id, urlDatabase) {
  let filterURL = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url]["userID"] === id) {
      filterURL[url] = urlDatabase[url];
    }
  }
  return filterURL;
};

const generateRandomString = function() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

module.exports = { lookUpEmail, urlsForUser, generateRandomString };