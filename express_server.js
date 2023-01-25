//////////////APP FUNCTIONS, VARIABLES, AND LIBRARIES
const express = require("express");
const app = express();
const PORT = 8080;

function generateRandomString() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

// STARTING DATABASE OF URLS
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
//CREATING NEW SHORT-LONG URL PAIR
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
