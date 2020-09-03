const express = require('express');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const { getUserByEmail } = require('./helpers')


const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

app.use(morgan('dev'));
//app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  i245bv: { longURL: "https://www.youtube.ca", userID: "bb1234" },
  i245G3: { longURL: "https://www.yahoo.ca", userID: "bb1234"}
};

// our users database demo
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



// Generate a string of 6 random alphanumeric characters
const generateRandomString = () => {
  return Math.random().toString(20).substr(2, 6);
};

const urlsForUser = (id) => {
  const userURLDatabase = {};  
  for (const url in urlDatabase) {
    if(urlDatabase[url].userID === id) {
      userURLDatabase[url] = urlDatabase[url];
    }
  }
  return userURLDatabase;
};
console.log(urlsForUser("bb1234"))


// Hello at root
app.get("/", (req, res) => {
  res.send("Hello!");
});

// our JSON object at /urls.json
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Hello World at /hello
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Show urls_index at /urls
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  if (user_id) {
    const userURLs = urlsForUser(user_id);
    let templateVars = { urls: userURLs, user: users[req.session["user_id"]] };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

// Create a new URL page urls_new at /urls/new
// Remember to put /urls/new ahead of /urls/:id so that "new" isn't treated as a short URL id
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  if (user_id) {
    let templateVars = { user: users[req.session["user_id"]] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// Get route to urls_show
app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.session.user_id;
  if (user_id) {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session["user_id"]] };
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/login");
  }
  //console.log(req.params.shortURL); keys to our object database
  //res.render("urls_show", templateVars);
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/register", (req, res) => {
  let templateVars = { user: users[req.session["user_id"]] };
  res.render('register', templateVars);
});

app.get("/login", (req, res) => {
  let templateVars = { user: users[req.session["user_id"]] };
  res.render('login', templateVars);
});

// The URL redirection GET route
app.get("/u/:shortURL", (req, res) => {
  const user_id = req.session.user_id;
  if (user_id) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.redirect("/urls");
  }
});



// <------------------- POST ------------------->


app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let newID = generateRandomString();
  
  // checking for edge cases
  // if user tries to enter empty string for both
  if (!email && !password) {
    res.status(400).send("Invalid email and password entered");
  } else if (getUserByEmail(email, users)) { // check if the email exist already
    res.status(400).send("Current user already exists");
  } else { // create the new user
    req.session.user_id = newID
    //res.cookie("user_id", newID);
    users[newID] = {
      id: newID,
      email: email,
      password: bcrypt.hashSync(password, 10) // add bcrypt here bcrypt.hashSync(password,  3)
    };
  }
  console.log(users); // check to make sure new user is added to user database
  res.redirect('/urls');
});

// Post route for new URLs being shortened
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let user_id = req.session.user_id;
  console.log(user_id)
  let newURL = req.body.longURL; // save the longURL (www.example.ca) to temp variable
  //console.log(newURL); debugging to check
  let randomString = generateRandomString(); // generate a random alphanumeric 6 char string
  console.log(urlDatabase)
  urlDatabase[randomString] = { longURL: newURL, userID: user_id }; // create the new object with the key/value pair
  console.log(urlDatabase); // debugging to check if it was actually created
  res.redirect('/urls');         // Respond with 'Ok' (we will replace this) // replaced with a different message
  // redirect directly to website res.redirect('/u/+randomString);

  // const user_id = req.cookies.user_id;
  // if (user_id) {
  //   const userURLs = urlsForUser(user_id);
  //   let templateVars = { urls: userURLs, user: users[req.cookies["user_id"]] };
  //   res.render("urls_index", templateVars);
  // } else {
  //   res.redirect("/login");
  // }
});

// POST route to delete an existing short URL account
app.post("/urls/:shortURL/delete", (req, res) => {
  const user_id = req.session.user_id;
  if (user_id) {
    const deleteURL = req.params.shortURL;
    delete urlDatabase[deleteURL];
    res.redirect('/urls');
} else {
    res.redirect("/urls");
  }

});

// POST route to change an existing short URL account
app.post("/urls/:id", (req, res) => {
  const user_id = req.session.user_id;
  if (user_id) {
    let fullURL = req.body.longURL;
    let oldShortURL = req.params.id;
    urlDatabase[oldShortURL].longURL = fullURL;
    res.redirect('/urls');
  } else {
    res.redirect("/login"); 
  }
});

// POST route for logging in and becoming cookied
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let userFound = getUserByEmail(email, users);

  if (!userFound) {
    res.status(403).send("User Info does not exist");
  } else {
    if (!bcrypt.compareSync(password, users[userFound].password)) {
      res.status(403).send("User Info does not match");
    } else {
      req.session.user_id = userFound
      //res.cookie("user_id", userFound);
      res.redirect("/urls");
    }
  }
});

//POST route for loggin out and clearing cookies
app.post("/logout", (req, res) => {
  req.session.user_id = null;
 //res.clearCookie("user_id");
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



// Another way to do app.post
// app.post("/urls", (req, res) => {
//   const newShortURL = generatedRandomString();
//   const newLongURL = req.body.longURL;
//   urlDatabase[newShortURL] = newLongURL;
//   console.log(urlDatabase);
//   let templateVars = { shortURL: newShortURL, longURL: urlDatabase[newShortURL] };
//   res.render("urls_show", templateVars);
// });