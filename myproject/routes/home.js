import express from 'express';
const router = express.Router();

// Middleware to protect route
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

router.get('/', checkAuthenticated, (req, res) => {
  res.render('home', { user: req.user });
});

export default router;
