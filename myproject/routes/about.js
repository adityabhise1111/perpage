import express from 'express';
const router = express.Router();



router.get('/', (req, res) => {
  res.render('about');
});
router.get('/manish', (req, res) => {
  res.render('manish');
});
router.get('/aditya', (req, res) => {
  res.render('aditya');
});

export default router;
