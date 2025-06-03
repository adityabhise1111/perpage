const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, JS, images) from 'public' folder
app.use(express.static('public'));

// Routes rendering EJS templates

app.get('/', (req, res) => {
  res.render('home'); // renders views/home.ejs
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', (req, res) => {
  // Registration logic here
  res.send('Register POST');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  // Login logic here
  res.send('Login POST');
});

app.post('/logout', (req, res) => {
  // Logout logic here
  res.send('Logout POST');
});

app.get('/writers', (req, res) => {
  // Example: pass writers list (empty for now)
  res.render('writers', { writers: [] });
});

app.get('/profile/:userId', (req, res) => {
  const userId = req.params.userId;
  res.render('profile', { userId });
});

app.post('/deal', (req, res) => {
  // Handle deal creation here
  res.send('Deal Created');
});

app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

app.get('/admin', (req, res) => {
  res.render('admin');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
