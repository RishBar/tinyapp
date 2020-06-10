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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body['longURL'];
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params["shortURL"]];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params['shortURL']] = req.body['longURL'];
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  console.log(req.body);
  res.cookie('username', req.body['username']);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let cookies = {
    username: req.cookies["username"]
  };
  let templateVars = { urls: urlDatabase, cookies };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let cookies = {
    username: req.cookies["username"]
  };
  let templateVars = {cookies};
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});


app.get("/urls/:shortURL", (req, res) => {
  let cookies = {
    username: req.cookies["username"]
  };
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], cookies };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});