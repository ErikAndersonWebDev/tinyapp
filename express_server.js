//////////////APP FUNCTIONS, VARIABLES, AND LIBRARIES
const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require("cookie-session");
const morgan = require("morgan");
const { generateRandomString, urlsForUser, getUserByEmail } = require("./helpers");
const { users, urlDatabase } = require("./database");

const bcrypt = require("bcryptjs");

app.use(morgan("dev"));
app.set("view engine", "ejs");
app.use(cookieSession({
    name: "tinyapp",
    keys: ["sdhdsfdfbsdasfhtrsgasfadss", "agthgdDADadssdfhhtgrfewdwasxcadvdfghtr"],
}));

app.use(express.urlencoded({ extended: true }));

/////// REGISTER
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("Please fill in email and password fields");
  };
  const existingUser = getUserByEmail(email, users);
  if (existingUser) {
    return res.status(400).send("Email already exits in database");
  };
  const id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: id,
    email: email,
    password: hashedPassword,
  };
  users[id] = newUser;
  req.session.user_id = newUser.id;
  return res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  return res.render("register", templateVars);
});

/////// LOGIN
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  };
  if (req.session.user_id) {
    return res.redirect("/urls");
  } else {
    return res.render("login", templateVars);
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(403).send("Please provide an email and password");
  };
  const existingUser = getUserByEmail(email, users);
  if (existingUser) {
    bcrypt.compare(password, users[existingUser].password)
    .then((result) => {
      if (result) {
        req.session.user_id = users[existingUser].id;
        return res.redirect("/urls");
      } else {
        return res.status(403).send("Invalid email and/or password");
      };
    });
  } else {
    return res.status(403).send("Invalid email and/or password");
  };
});
/////// LOGOUT
app.post("/logout", (req, res) => {
  req.session = null;
  return res.redirect("/urls");
});

////////ROUTING

//HOMEPAGE - REDIRECTED TO URLS
app.get("/", (req, res) => {
  if (!req.session) {
    return res.redirect("/login");
  }
  else {
    return res.redirect("/urls");
  }
});

app.get("/urls.json", (req, res) => {
  return res.json(urlDatabase);
});

//URLS MAIN PAGE WITH LIST OF URLS
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const urls = urlsForUser(userID, urlDatabase);
  const templateVars = {
    user: users[userID],
    urls: urls
  };
  return res.render("urls_index", templateVars);
});

//CREATING NEW SHORT-LONG URL PAIR
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  if (!req.session.user_id) {
    return res.redirect("/login");
  } else {
    return res.render("urls_new", templateVars);
  };
});

//DELETING A URL
app.post("/urls/:id/delete", (req, res) => {
  const user = req.session.user_id;
  if (!user) {
    return res.status(400).send("User is not logged in. Please Login");
  };
  const id = req.params.id;
  if (urlDatabase[id].user_id !== user) {
    return res.status(400).send("You do not own this URL");
  };
  let foundUrlId = null;
  for (let urlID in urlDatabase) {
    if (urlID === id) {
      delete urlDatabase[id];
      foundUrlId = true;
    }
  };
  if (!foundUrlId) {
    return res.status(400).send("URL ID not found, please try again");
  };
  return res.redirect("/urls");
});

//EDITING A URL FROM FORM
app.post("/urls/:id", (req, res) => {
  const user = req.session.user_id;
  if (!user) {
    return res.status(400).send("User is not logged in. Please Login");
  };
  const id = req.params.id;
  const longURL = req.body.longURL;
  if (!urlDatabase[id]) {
    return res.status(400).send("URL does not exist. Please try again");
  };
  if (urlDatabase[id].user_id !== user) {
    return res.status(400).send("You do not own this URL");
  };
  if (!longURL.includes("http://www.")) {
    return res.status(400).send("Invalid URL, try again");
  }
  urlDatabase[id].longURL = longURL;
  return res.redirect("/urls");
});
//SPECIFIC URL PAIR INFO PAGE WITH EDIT FORM
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
  };
  return res.render("urls_show", templateVars);
});
//CREATING A NEW URL PAIR
app.post("/urls", (req, res) => {
  const user = req.session.user_id;
  const newShortURL = generateRandomString();
  const longURL = req.body.longURL
  if (!longURL.includes("http://www.")) {
    return res.status(400).send("Invalid URL, try again");
  }
  urlDatabase[newShortURL] = {
    longURL: longURL,
    user_id: user
  };
  return res.redirect(`/urls/${newShortURL}`);
});
//REDIRECTED TO URL WEBPAGE WHEN CLICKING ON SHORT URL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  return res.redirect(longURL);
});

//LISTENING ON PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
