import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import passport from 'passport';
import initialize from './config/passport-config.js';
import connectDB from './config/db.js';


// Route imports
import authRoutes from './routes/auth.js';
import homeRoutes from './routes/home.js';
import dealRoutes from './routes/deal.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

// // MongoDB Connection
// const connectDB = async () => {
//   try {
//     await mongoose.connect(process.env.MONGO_URL);
//     console.log('✅ Connected to MongoDB');
//   } catch (err) {
//     console.error('❌ MongoDB connection error:', err);
//     throw err;
//   }
// };

// Middleware

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session Middleware
app.use(session({
  secret: 'secretkey',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URL,
    collectionName: 'sessions'
  })
}));

// Passport Initialization
initialize(passport);
app.use(passport.initialize());
app.use(passport.session());

// Static Files (Optional)
app.use(express.static(path.join(__dirname, 'public')));

// Route Mounting
app.use('/', authRoutes);         // /login, /register, /auth/google, etc.
app.use('/home', homeRoutes);     // /home (protected)
app.use('/deal', dealRoutes);     // /deal (uploads, forms)
app.use('/dashboard', dashboardRoutes); // /dashboard view

// Default Route
app.get('/', (req, res) => {
  res.redirect('/home');
});

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error('❌ Server failed to start:', err);
    process.exit(1);
  }
};

startServer();
