/* ToC:
Setup
Functions
Variables
.GET
.POST
*/

const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080;

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['ads245j8f1has5dhf6jkad', 'j1oi47e8j9rwklj989l2ka']
}));

app.set("view engine", "ejs");

const { generateRandomString, getUserByEmail, urlForUser } = require('./helpers');

const urlDatabase = {};
const users = {};


app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const userURLs = urlForUser(userID, urlDatabase);
  if (!userID) {
    res.send('Please Login or Register');
  } else {
    const templateVars = {
      user: users[userID],
      urls: userURLs
    };
    res.render("urls_index", templateVars);
  }
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("urls_register", templateVars);
  }
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("urls_login", templateVars);
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const database = urlDatabase[req.params.id];
  if (!database) {
    return res.send("URL Does Not Exist");
  }
  if (!userID) {
    return res.send("Please Login to View");
  }
  if (userID !== database.userID) {
    res.send("Need Permission to View");
  } else {
    const templateVars = {
      user: users[userID],
      id: req.params.id, longURL: urlDatabase[req.params.id].longURL
    }
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (!longURL) {
    res.status(404);
    res.send('Invalid ID');
  } else {
    res.redirect(longURL.longURL);
  }
});

app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    let id = generateRandomString();
    urlDatabase[id] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect(`/urls/${id}`);
  } else {
    res.send('Please log in to continue.');
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const user = getUserByEmail(email, users);
  if (!user) {
    res.status(403);
    res.send('403 Forbidden Please Register');
  }
  if (user) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      req.session.user_id = user.id;
      res.redirect("/urls");
    } else {
      res.status(403);
      res.send('403 Forbidden');
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  if (email === '' || req.body.password === '') {
    res.status(400);
    return res.send('400 Bad Request Cannot Leave Fields Empty');
  }
  if (getUserByEmail(email, users)) {
    res.status(400);
    res.send('400 Bad Request Re-Enter Email');
  } else {
    users[id] = {
      id,
      email,
      password
    };
    req.session.user_id = id;
    res.redirect("/urls");
  }
});

app.post("/urls/:id", (req, res) => {
  const userID = req.session.user_id;
  const database = urlDatabase[req.params.id];
  if (userID && userID === database.userID) {
    urlDatabase[req.params.id].longURL = req.body.editURL;
    res.redirect("/urls");
  } else {
    res.send('Permission Not Granted');
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const userID = req.session.user_id;
  const database = urlDatabase[req.params.id];
  if (userID && userID === database.userID) {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  } else {
    res.send('Permission Needed to Delete');
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});