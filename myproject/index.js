import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import dealRoutes from './routes/deal.js';  // import deal router
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware for parsing form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
  res.render('home');
});

//use dashboard router
app.use('/dashboard', dashboardRoutes);

// Use deal router for /deal route
app.use('/deal', dealRoutes);

// MongoDB connection function
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

// Start the server after DB is connected
const startServer = async () => {
  try {
    await connectDB();
    app.listen(3000, () => {
      console.log('Server running on http://localhost:3000');
    });
  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
};

startServer();
