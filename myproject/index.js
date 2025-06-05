import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import  initialize  from './passport-config.js';

import dealRoutes from './routes/deal.js';  
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set view engine and views path
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session middleware (important to load before passport)
app.use(session({
  secret: 'secretkey',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    collectionName: 'sessions'
  })
}));

// Initialize Passport and session
initialize(passport);
app.use(passport.initialize());
app.use(passport.session());

// Routes

// Root redirect
app.get('/', (req, res) => {
  res.redirect('/home');
});

// Auth routes
app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  res.render('login-improved');
});

app.post('/login', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/login',
  failureMessage: true
}));

// Google OAuth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', 
  passport.authenticate('google', {
    successRedirect: '/home',
    failureRedirect: '/login'
  })
);

// Logout route
app.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) return next(err);
    res.redirect('/login');
  });
});

// Middleware to protect routes
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

app.get('/home', checkAuthenticated, (req, res) => {
  res.render('home', { user: req.user });
});

// Other routers
app.use('/dashboard', dashboardRoutes);
app.use('/deal', dealRoutes);

// Start server after DB connection
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

startServer();
