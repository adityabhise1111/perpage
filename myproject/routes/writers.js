import express from 'express';
import { User } from '../models/User.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const writers = await User.find({ role: 'writer' });
    res.render('writers', { writers });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

export default router;
