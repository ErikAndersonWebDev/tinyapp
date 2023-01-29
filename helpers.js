// Generates a random 6-character string
const generateRandomString = function () {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Compares the url database with a given user and returns an object of urls that belong to that user, if any
const urlsForUser = function (user, urls) {
  const userUrls = {};
  for (let url in urls) {
    if (urls[url].user_id === user) {
      userUrls[url] = urls[url].longURL;
    }
  }
  return userUrls;
};

// Compares the user database with a given email address and returns the user ID, returns undefined if not found
const getUserByEmail = function (email, users) {
  for (let index in users) {
    if (users[index].email === email) {
      return users[index].id;
    }
  }
  return undefined;
};

module.exports = { generateRandomString, urlsForUser, getUserByEmail };
