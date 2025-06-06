import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { s3Client, bucketName } from '../config/s3.js';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import Deal from '../models/deal.js';
import { User } from '../models/User.js';

const router = express.Router();

// Middleware to protect route
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

// Multer config
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// GET /deal?writerId=xxx
router.get('/', checkAuthenticated, async (req, res) => {
  try {
    const writerId = req.query.writerId;

    if (!writerId || !mongoose.Types.ObjectId.isValid(writerId)) {
      return res.status(400).send("Invalid writer ID");
    }

    const writer = await User.findById(writerId);
    if (!writer) return res.status(404).send("Writer not found");

    res.render('deal', {
      writerId: writer._id,
      writerName: writer.name,
      writerPrice: writer.pricePerPage,
      userId: req.user._id, // from session
      userName: req.user.name // optional for display
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// POST /deal
router.post('/', checkAuthenticated, upload.single('file'), async (req, res) => {
  try {
    const {
      userId,
      writerId,
      pages,
      totalPrice,
      userNotes,
      writerNotes,
      status
    } = req.body;

    const file = req.file;
    if (!file) {
      return res.status(400).send('No file uploaded');
    }

    // Validate writerId
    const writer = await User.findById(writerId);
    if (!writer) return res.status(400).send("Writer does not exist");

    // Upload file to S3
    const fileKey = `uploads/${Date.now()}_${file.originalname}`;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);

    // Save deal
    const deal = new Deal({
      userId: new mongoose.Types.ObjectId(userId),
      writerId: new mongoose.Types.ObjectId(writerId),
      pages,
      totalPrice,
      userNotes,
      writerNotes,
      status,
      fileLinks: [fileKey],
      submissionFiles: []
    });


    await deal.save();
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).send('Failed to create deal');
  }
});

export default router;
