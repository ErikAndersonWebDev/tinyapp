//////////////APP FUNCTIONS, VARIABLES, AND LIBRARIES
const express = require("express");
const app = express();
const PORT = 8080;
const cookieSession = require("cookie-session")
const morgan = require("morgan");
const { generateRandomString, urlsForUser } = require("./helpers")
const bcrypt = require("bcryptjs")

app.use(morgan("dev"))
app.set("view engine", "ejs");
app.use(cookieSession({
  name: "tinyapp",
  keys: ["sdhdsfdfbsdasfhtrsgasfadss", "agthgdDADadssdfhhtgrfewdwasxcadvdfghtr"]
}))
app.use(express.urlencoded({ extended: true }));

// STARTING DATABASE OF URLS
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    user_id: "3212"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    user_id: "123"
  }
};

/////// USER DATABASE
const users = {
  123: {
    id: "123",
    email: "a@a.com",
    password: "111"
  },
  "kIQTay": {
    id: "kIQTay",
    email: "b@b.com",
    password: "$2a$10$Xh9IQVUvQStAClgisQ/DD.4dsSe2MW59c/qJvcts/1h6PX/K/4GKy"
  }
}

/////// REGISTER
app.post("/register", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  if (!email || !password) {
    return res.status(400).send("Please fill in email and password fields")
  }
  for (let index in users) {
    if (users[index].email === email) {
      return res.status(400).send("Email already exits in database")
    }
  }
  const id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: id,
    email: email,
    password: hashedPassword
  }
  console.log(newUser) ///////////////////////////
  users[id] = newUser
  req.session.user_id = newUser.id
  res.redirect("/urls")
})

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  }
  if (req.session.user_id) {
    res.redirect("/urls")
  }
  res.render("register", templateVars)
})

/////// LOGIN
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  }
  if (req.session.user_id) {
    res.redirect("/urls")
  } else {
  res.render("login", templateVars)
}})

app.post("/login", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  if (!email || !password) {
    return res.status(403).send("Please provide an email and password")
  }
  for (let userID in users) {
    const user = users[userID]
    if (user.email === email) {
      bcrypt.compare(password, user.password)
      .then((result) => {
        if (result) {
          req.session.user_id = "user.id"
          res.redirect("/urls")
        } else {
          return res.status(403).send("Invalid email and/or password")
        }
      })
    }
  }
  return res.status(403).send("Invalid email and/or password")
});
/////// LOGOUT
app.post("/logout", (req, res) => {
  req.session = null
  res.redirect("/urls")
})

////////ROUTING
//HOMEPAGE - REDIRECTED TO URLS
app.get("/", (req, res) => {
  res.redirect("/urls")
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
//URLS MAIN PAGE WITH LIST OF URLS
app.get("/urls", (req, res) => {
  const userID = req.session.user_id
  const urls = urlsForUser(userID, urlDatabase)
  const templateVars = {
    user: users[userID],
    urls: urls
  }
  res.render("urls_index", templateVars);
});
//CREATING NEW SHORT-LONG URL PAIR
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id]
  }
  if (!req.session.user_id) {
    res.redirect("/login")
  }
  res.render("urls_new", templateVars);
});

//DELETING A URL
app.post("/urls/:id/delete", (req, res) => {
  const user = req.session.user_id
  if (!user) {
    return res.status(400).send("User is not logged in. Please Login")
  }
  const id = req.params.id
  if (urlDatabase[id].user_id !== user) {
    return res.status(400).send("You do not own this URL")
  }
  let foundUrlId = null;
  for (let urlID in urlDatabase) {
    if (urlID === id) {
      delete urlDatabase[id]
      foundUrlId = true
    }
  }
  if (!foundUrlId) {
    return res.status(400).send("URL ID not found, please try again")
  }
  res.redirect("/urls")
});

//EDITING A URL FROM FORM
app.post("/urls/:id", (req, res) => {
  const user = req.session.user_id
  if (!user) {
    return res.status(400).send("User is not logged in. Please Login")
  }
  const id = req.params.id
  if (!urlDatabase[id]) {
    return res.status(400).send("URL does not exist. Please try again")
  }
  if (urlDatabase[id].user_id !== user) {
    return req.status(400).send("You do not own this URL")
  }
  const longURL = req.body.longURL
  urlDatabase[id].longURL = longURL
  res.redirect("/urls")
});
//SPECIFIC URL PAIR INFO PAGE WITH EDIT FORM
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
  };
  res.render("urls_show", templateVars);
});
//CREATING A NEW URL PAIR
app.post("/urls", (req, res) => {
  const user = req.session.user_id;
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = {
    longURL: req.body.longURL,
    user_id: user
  }
  res.redirect(`/urls/${newShortURL}`)
});
//REDIRECTED TO URL WEBPAGE WHEN CLICKING ON SHORT URL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});


//LISTENING ON PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
