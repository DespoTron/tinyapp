const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 8080; // default port 8080

app.use(morgan('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  //shortURL: longURL
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
}


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
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

// Create a new URL page urls_new at /urls/new
// Remember to put /urls/new ahead of /urls/:id so that "new" isn't treated as a short URL id
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] }
  res.render("urls_new", templateVars);
});

// Get route to urls_show
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
  //console.log(req.params.shortURL); keys to our object database
  res.render("urls_show", templateVars);
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/register", (req, res) => {
  let templateVars = { users: users[req.cookies["user_id"]] };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
 
  let newID = generateRandomString();
  res.cookie("user_id", newID);
  users[newID] = {
    id: newID,
    email: email,
    password: password
  };  
  console.log(users); // check to make sure new user is added to user database
  res.redirect('/urls')
})



// Post route for new URLs being shortened
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let newURL = req.body.longURL; // save the longURL (www.example.ca) to temp variable
  //console.log(newURL); debugging to check
  let randomString = generateRandomString(); // generate a random alphanumeric 6 char string
  urlDatabase[randomString] = newURL; // create the new object with the key/value pair
  console.log(urlDatabase); // debugging to check if it was actually created
  res.redirect('/urls');         // Respond with 'Ok' (we will replace this) // replaced with a different message
  // redirect directly to website res.redirect('/u/+randomString);
  });

// POST route to delete an existing short URL account
app.post("/urls/:shortURL/delete", (req, res) => {
  const deleteURL = req.params.shortURL;
  console.log(deleteURL);
  delete urlDatabase[deleteURL];
  res.redirect('/urls');
});

// POST route to change an existing short URL account
app.post("/urls/:id", (req, res) => {
  console.log(req.body);
  let fullURL = req.body.newLongURL;
  console.log(fullURL)
  console.log(req.params);
  let oldShortURL = req.params.id;
  console.log(oldShortURL);
  urlDatabase[oldShortURL] = fullURL;
  // Redirect back to the urls index page
  res.redirect('/urls');
});

// POST route for logging in and becoming cookied
app.post("/login", (req, res) => {
  // Set a cookie with Express's built in res.cookie
  const username = req.body.username;
  res.cookie("username", username);
  // After logging in, redirect to /urls
  res.redirect("/urls");
});

//POST route for loggin out and clearing cookies
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});


// The URL redirection GET route
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
 
  res.redirect(longURL);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Generate a string of 6 random alphanumeric characters
const generateRandomString = () => {
  return Math.random().toString(20).substr(2, 6);
};

// Another way to do app.post
// app.post("/urls", (req, res) => {
//   const newShortURL = generatedRandomString();
//   const newLongURL = req.body.longURL;
//   urlDatabase[newShortURL] = newLongURL;
//   console.log(urlDatabase);
//   let templateVars = { shortURL: newShortURL, longURL: urlDatabase[newShortURL] };
//   res.render("urls_show", templateVars);
// });