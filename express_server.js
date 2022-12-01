const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080;

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

const urlDatabase = {};

const users = {};

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
      const result = users[user]
      return result;
    }
    return null;
  }
};

const urlForUser = (id, urlDatabase) => {
  let userURL = {};
  for (const key in urlDatabase) {
    if (id === urlDatabase[key].userID) {
      userURL[key] = urlDatabase[key];
    }
  }
  return userURL;
};


app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const userURLs = urlForUser(userID, urlDatabase);
  if (!userID) {
    res.send('Please Login or Register')
  };
  const templateVars = {
    user: users[userID],
    urls: userURLs
  };
  res.render("urls_index", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  if (req.cookies["user_id"]) {
    return res.redirect("/urls")
  }
  res.render("urls_register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }
  res.render("urls_login", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  if (!req.cookies["user_id"]) {
    return res.redirect("/login")
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"];
  const database = urlDatabase[req.params.id];
  if (!userID) {
    return res.send("Please Login to View")
  }
  if (userID !== database.userID) {
    return res.send("Need Permission to View")
  }
  const templateVars = {
    user: users[userID],
    id: req.params.id, longURL: urlDatabase[req.params.id].longURL
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (!longURL) {
    res.status(404);
    return res.send('Invalid ID');
  }
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    let id = generateRandomString();
    urlDatabase[id] = {
      longURL: req.body.longURL,
      userID: req.cookies["user_id"]
    };
    return res.redirect(`/urls/${id}`);
  }
  res.send('Please log in to continue.')
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const user = doesUserExist(email, users);
  if (!user) {
    res.status(403);
    res.send('403 Forbidden Please Register');
  }
  if (user) {
    if (req.body.password === user.password) {
      res.cookie('user_id', user.id); // gives me aJ48lW
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
  const userID = req.cookies["user_id"];
  const database = urlDatabase[req.params.id];
  if (userID && userID === database.userID) {
    urlDatabase[req.params.id] = req.body.editURL;
    res.redirect("/urls");
  } else {
    res.send('Permission Not Granted');
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const userID = req.cookies["user_id"];
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