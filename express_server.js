const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const urlDatabase = {
  //shortURL: longURL
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// Create a new URL page urls_new at /urls/new
// Remember to put /urls/new ahead of /urls/:id so that "new" isn't treated as a short URL id
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Get route to urls_show 
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  //console.log(req.params.shortURL); keys to our object database
  res.render("urls_show", templateVars);
});

// The URL redirection GET route
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
 
  res.redirect(longURL);
});


app.get("/set", (req, res) => {
 const a = 1;
 res.send(`a = ${a}`);
});

// app.get("/fetch", (req, res) => {
//  res.send(`a = ${a}`);
// });

// Post route for new URLs being shortened
app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  let newURL = req.body.longURL; // save the longURL (www.example.ca) to temp variable
  //console.log(newURL); debugging to check
  let randomString = generateRandomString(); // generate a random asymateric 6 char string
  urlDatabase[randomString] = newURL; // create the new object with the key/value pair
  console.log(urlDatabase); // debugging to check if it was actually created
  res.redirect('/urls');         // Respond with 'Ok' (we will replace this) // replaced with a different message
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Generate a string of 6 random alphanumeric characters
function generateRandomString() {
  return Math.random().toString(20).substr(2, 6);
}

// Another way to do app.post
// app.post("/urls", (req, res) => {
//   const newShortURL = generatedRandomString();
//   const newLongURL = req.body.longURL;
//   urlDatabase[newShortURL] = newLongURL;
//   console.log(urlDatabase);
//   let templateVars = { shortURL: newShortURL, longURL: urlDatabase[newShortURL] };
//   res.render("urls_show", templateVars);
// });