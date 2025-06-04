import express from 'express';
const router = express.Router();

// Add routes
router.get('/', (req, res) => {
  res.send('This is the deals page');
});

export default router;
