import express from 'express';
import multer from 'multer';
import { s3Client, bucketName } from '../config/s3.js';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import Deal from '../models/deal.js';

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

// GET /deal
router.get('/', checkAuthenticated, (req, res) => {
  res.render('deal');
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

    const fileKey = `uploads/${Date.now()}_${file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await s3Client.send(command);

    const fileUrl = fileKey; // just save key for now

    const deal = new Deal({
      userId,
      writerId,
      pages,
      totalPrice,
      userNotes,
      writerNotes,
      status,
      fileLinks: [fileUrl],
      submissionFiles: []
    });

    await deal.save();
    res.send('Deal created and file uploaded to S3!');
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).send('Failed to create deal');
  }
});

export default router;
