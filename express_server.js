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
    password: "purple-monkey-dinosaur",
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
    result += chars[Math.ceil(Math.random() * chars.length)];
  }
  return result;
}

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
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("urls_register", templateVars);
});

app.get("/urls/new", (req, res) => {
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
  const longURL = urlDatabase[req.params.id]
  if (!longURL) {
    res.status(404);
    res.send('404 Page Not Found');
  }
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  let id = generateRandomString();
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`)
});

app.post("/login", (req, res) => {
  const user = req.body.username;
  res.cookie('user', user);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  const user = req.body.username;
  res.clearCookie('user', user);
  res.redirect("/urls");
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
  }
  res.cookie('user_id', id);
  res.redirect("/urls");
})

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.editURL;
  res.redirect(`/urls`)
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});