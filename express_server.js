//////////////APP FUNCTIONS, VARIABLES, AND LIBRARIES
const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
const morgan = require("morgan");
function generateRandomString() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
app.use(morgan("dev"))
app.set("view engine", "ejs");
app.use(cookieParser())
app.use(express.urlencoded({ extended: true }));

// STARTING DATABASE OF URLS
let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

/////// USER DATABASE
const users = {
  123: {
    id: "123",
    email: "a@a.com",
    password: "111"
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
    console.log(users[index].email)
    if (users[index].email === email) {
      return res.status(400).send("Email already exits in database")
    }
  }
  const id = generateRandomString();
  const newUser = {
    id: id,
    email: email,
    password: password
  }
  users[id] = newUser
  res.cookie("user_id", newUser.id)
  console.log(newUser.id)
  res.redirect("/urls")
})

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("register", templateVars)
})

/////// LOGIN
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("login", templateVars)
})

app.post("/login", (req, res) => {
  const email = req.body.email
  const password = req.body.password
  if (!email || !password) {
    return res.status(403).send("Please provide an email and password")
  }
  let foundUser = null
  for (let userID in users) {
    const user = users[userID]
    if (user.email === email && user.password === password) {
      foundUser = user;
    }
  }
  if (!foundUser) {
    return res.status(403).send("Invalid email and/or password")
  }
  res.cookie("user_id", foundUser.id)
  res.redirect("/urls")
});
/////// LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
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
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  console.log(templateVars)
  res.render("urls_index", templateVars);
});
//CREATING NEW SHORT-LONG URL PAIR
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_new", templateVars);
});

//DELETING A URL
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id
  delete urlDatabase[id] 
  res.redirect("/urls")
});

//EDITING A URL FROM FORM
app.post("/urls/:id", (req, res) => {
  const id = req.params.id
  const longURL = req.body.longURL
  urlDatabase[id] = longURL
  res.redirect("/urls")
});
//SPECIFIC URL PAIR INFO PAGE WITH EDIT FORM
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});
//CREATING A NEW URL PAIR
app.post("/urls", (req, res) => {
  const newShortURL = generateRandomString();
  urlDatabase[newShortURL] = req.body.longURL;
  res.redirect(`/urls/${newShortURL}`)
});
//REDIRECTED TO URL WEBPAGE WHEN CLICKING ON SHORT URL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});


//LISTENING ON PORT
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
