const express = require('express');
const app = express();
const PORT = 3000;

const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');

const generateRandomString = function() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "userRandomID"}
};

const users = {
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

let uniqueEmail = function(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return false;
    }
  }
  return true;
};


app.post("/urls", (req, res) => {
  if (req.cookies["userID"]) {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL: req.body['longURL'], userID: req.cookies["userID"]};
    console.log(urlDatabase);
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.redirect("/login");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params["shortURL"]];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params['shortURL']] = { longURL: req.body['longURL'], userID: req.cookies["userID"]};
  res.redirect(`/urls`);
});

app.post("/register", (req, res) => {
  let userID = generateRandomString();
  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send('Cannot use empty email of password');
  } else if (!uniqueEmail(req.body.email)) {
    res.status(400);
    res.send('Cannot use existing email');
  } else {
    res.cookie('userID', userID);
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: req.body.password
    };
    res.redirect(`/urls`);
  }
});

app.post("/login", (req, res) => {
  if (uniqueEmail(req.body.email)) {
    res.status(403);
    res.send('email not registered');
  }
  for (const user in users) {
    if (users[user].email === req.body.email && users[user].password === req.body.password) {
      res.cookie('userID', user);
      res.redirect("/urls");
      return;
    }
  }
  res.status(403);
  res.send('password or email incorrect');
});

app.post("/logout", (req, res) => {
  res.clearCookie("userID");
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let cookies = {
    "userID": req.cookies["userID"]
  };
  let templateVars = { urls: urlDatabase, cookies, users };
  res.render("urls_index", templateVars);
});

app.get("/login", (req, res) => {
  let cookies = {
    "userID": req.cookies["userID"]
  };
  let templateVars = { urls: urlDatabase, cookies, users };
  res.render("login", templateVars);
});

app.get('/register', (req, res) => {
  let cookies = {
    "userID": req.cookies["userID"]
  };
  let templateVars = { urls: urlDatabase, cookies, users };
  res.render("register", templateVars);
});

app.get("/urls/new", (req, res) => {
  let cookies = {
    "userID": req.cookies["userID"]
  };
  let templateVars = {cookies, users};
  if (req.cookies["userID"]) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]["longURL"]);
});


app.get("/urls/:shortURL", (req, res) => {
  let cookies = {
    "userID": req.cookies["userID"]
  };
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"], cookies, users };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});