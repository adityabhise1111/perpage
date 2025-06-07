import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { User } from '../models/User.js';

const router = express.Router();


// 🔒 Middleware to ensure user is Not authenticated
function checkNotAuthenticated(req, res, next) {
  if (!req.isAuthenticated()) return next();
  res.redirect('/home');
}

// Register Page
router.get('/register', (req, res) => {
  res.render('register');
});

// Register Logic
router.post('/register',
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('name').notEmpty().withMessage('Name is required')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.send(errors.array().map(err => err.msg).join('<br>'));
    }

    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.send('User already exists!');

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.redirect('/login');
  }
);

// Login Page
router.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login-improved');
});

// Login Logic
router.post('/login', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/login',
  failureMessage: true
}));

// Google OAuth
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', {
  successRedirect: '/home',
  failureRedirect: '/login'
}));

// Logout
router.get('/logout', (req, res, next) => {
  req.logout(function (err) {
    if (err) return next(err);
    res.redirect('/login');
  });
});

export default router;
