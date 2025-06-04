import express from 'express';
import Deal from '../models/Deal.js';

const router = express.Router();

// GET /dashboard - list all deals
router.get('/', async (req, res) => {
  try {
    const deals = await Deal.find().lean(); // lean() for plain JS objects

    res.render('dashboard', { deals });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading deals');
  }
});

export default router;
