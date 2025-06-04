import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import Deal from './models/deal.js';

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes

// Home page
app.get('/', (req, res) => {
  res.render('home');
});

// Show deal form
app.get('/deal', (req, res) => {
  res.render('deal');
});

// Handle deal form submission
app.post('/deal', async (req, res) => {
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
  } catch (error) {
    console.error(error);
    res.status(500).send('Error creating deal');
  }
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(3000, () => console.log('Server running on http://localhost:3000'));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });
