const express = require('express');
const app = express();
const PORT = 3000;
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const lookUpEmail = require("./helper.js").lookUpEmail;
const urlsForUser = require("./helper.js").urlsForUser;
const generateRandomString = require("./helper.js").generateRandomString;
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ['userID'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "user2RandomID"}
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

app.post("/urls", (req, res) => {
  if (req.session["userID"]) {
    let shortURL = generateRandomString();
    urlDatabase[shortURL] = { longURL: req.body['longURL'], userID: req.session["userID"]};
    res.redirect(`/urls/${shortURL}`);
  } else {
    let error = "You need to login before making new urls.";
    let templateVars = {error};
    res.render("error", templateVars);
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params["shortURL"]] === undefined) {
    let error = "That url hasn't been created";
    let templateVars = {error};
    res.render("error", templateVars);
    return;
  } else if (urlDatabase[req.params["shortURL"]].userID === req.session["userID"]) {
    delete urlDatabase[req.params["shortURL"]];
    res.redirect("/urls");
  } else if (!req.session["userID"]) {
    let error = "you need to login before deleting urls";
    let templateVars = {error};
    res.render("error", templateVars);
  } else if (!(urlDatabase[req.params["shortURL"]].userID === req.session["userID"])) {
    let error = "you cant delete someone elses url";
    let templateVars = {error};
    res.render("error", templateVars);
  }
});

app.post("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params["shortURL"]] === undefined) {
    let error = "That url hasn't been created";
    let templateVars = {error};
    res.render("error", templateVars);
    return;
  } else if (urlDatabase[req.params["shortURL"]].userID === req.session["userID"]) {
    urlDatabase[req.params['shortURL']] = { longURL: req.body['longURL'], userID: req.session["userID"]};
    res.redirect(`/urls`);
  } else if (!req.session["userID"]) {
    let error = "you need to login before editing urls";
    let templateVars = {error};
    res.render("error", templateVars);
  } else if (!(urlDatabase[req.params["shortURL"]].userID === req.session["userID"])) {
    let error = "you cant edit someone elses url";
    let templateVars = {error};
    res.render("error", templateVars);
  }
});

app.post("/register", (req, res) => {
  let userID = generateRandomString();
  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send('Cannot use empty email of password');
  } else if (lookUpEmail(req.body.email, users)) {
    res.status(400);
    res.send('Cannot use existing email');
  } else {
    req.session.userID = userID;
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    res.redirect(`/urls`);
  }
});

app.post("/login", (req, res) => {
  if (!lookUpEmail(req.body.email, users)) {
    res.status(403);
    res.send('email not registered');
  }
  if (lookUpEmail(req.body.email, users)["email"] === req.body.email && bcrypt.compareSync(req.body.password, lookUpEmail(req.body.email, users)["password"])) {
    req.session.userID = lookUpEmail(req.body.email, users)["id"];
    res.redirect("/urls");
    return;
  }
  res.status(403);
  res.send('password or email incorrect');
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.get("/", (req, res) => {
  if (req.session["userID"]) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls", (req, res) => {
  let cookies = {
    "userID": req.session["userID"]
  };
  let filterURL = urlsForUser(req.session["userID"], urlDatabase);
  let user = users[req.session["userID"]];
  // let userEmail = users[req.session["userID"]]["email"];
  let templateVars = { urls: filterURL, cookies, user };
  res.render("urls_index", templateVars);
});

app.get("/login", (req, res) => {
  if (req.session["userID"]) {
    res.redirect("/urls");
  }
  let cookies = {
    userID : req.session["userID"]
  };
  let user = users[req.session["userID"]];
  let templateVars = { urls: urlDatabase, cookies, user };
  res.render("login", templateVars);
});

app.get('/register', (req, res) => {
  if (req.session["userID"]) {
    res.redirect("/urls");
  }
  else {
    let cookies = {
      "userID": req.session["userID"]
    };
    let user = users[req.session["userID"]];
    let templateVars = { urls: urlDatabase, cookies, user };
    res.render("register", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  let cookies = {
    "userID": req.session["userID"]
  };
  let user = users[req.session["userID"]];
  let templateVars = {cookies, user};
  if (req.session["userID"]) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/u/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    let error = "That url hasn't been created";
    let templateVars = {error};
    res.render("error", templateVars);
  } else {
    res.redirect(urlDatabase[req.params.shortURL]["longURL"]);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.session["userID"]) {
    let error = "you need to login before seeing urls";
    let templateVars = {error};
    res.render("error", templateVars);
  } else if (urlDatabase[req.params["shortURL"]] === undefined) {
    let error = "That url hasn't been created";
    let templateVars = {error};
    res.render("error", templateVars);
    return;
  } else if (urlDatabase[req.params["shortURL"]].userID === req.session["userID"]) {
    let cookies = {
      "userID": req.session["userID"]
    };
    let user = users[req.session["userID"]];
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]["longURL"], cookies, user };
    res.render("urls_show", templateVars);
  } else {
    let error = "Thats not your url!";
    let templateVars = {error};
    res.render("error", templateVars);
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});