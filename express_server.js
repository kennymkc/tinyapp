const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "123",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const generateRandomString = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};

const doesUserExist = (email, users) => {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
    return null;
  }
};

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls")
  }
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    res.redirect("/urls")
  }
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_login", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login") //return to avoid header Error
  }
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
    id: req.params.id, longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (!longURL) {
    res.status(404);
    return res.send('Invalid ID');
  }
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    let id = generateRandomString();
    urlDatabase[id] = req.body.longURL;
    return res.redirect(`/urls/${id}`);
  }
  res.send('Please log in to continue.')
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  let user = doesUserExist(email, users);
  if (!user) {
    res.status(403);
    res.send('403 Forbidden');
  }
  if (user) {
    if (req.body.password === user.password) {
      res.cookie('user_id', user.id);
      res.redirect("/urls");
    } else {
      res.status(403);
      res.send('403 Forbidden');
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  let id = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  if (email === '' || password === '') {
    res.status(400);
    res.send('400 Bad Request');
  }
  if (doesUserExist(email, users)) {
    res.status(400);
    res.send('400 Bad Request');
  }
  users[id] = {
    id,
    email,
    password
  };
  res.cookie('user_id', id);
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.editURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});