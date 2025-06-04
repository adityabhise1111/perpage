// routes/deal.js
import express from 'express';
import Deal from '../models/Deal.js';

const router = express.Router();

// GET /deal - Show form
router.get('/', (req, res) => {
  res.render('deal');
});

// POST /deal - Handle form submission
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      writerId,
      pages,
      totalPrice,
      userNotes,
      writerNotes,
      fileLinks,
      status,
      submissionFiles
    } = req.body;

    const deal = new Deal({
      userId,
      writerId,
      pages,
      totalPrice,
      userNotes,
      writerNotes,
      status,
      fileLinks: fileLinks?.split(',').map(link => link.trim()),
      submissionFiles: submissionFiles?.split(',').map(link => link.trim())
    });

    await deal.save();
    res.send('Deal created successfully!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating deal');
  }
});

export default router;
