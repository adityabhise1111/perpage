import express from 'express';
import multer from 'multer';
import { s3, bucketName } from '../config/s3.js'; // You must have this
import Deal from '../models/deal.js';

const router = express.Router();

// Multer-S3 Storage setup
const upload = multer({
  storage: multer.memoryStorage(), // You can use multer-s3 too, but let's go step by step
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

// GET /deal - Show form
router.get('/', (req, res) => {
  res.render('deal');
});

// POST /deal - Handle form and file upload
router.post('/', upload.single('file'), async (req, res) => {
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

    // Access uploaded file
    const file = req.file;

    if (!file) {
      return res.status(400).send('No file uploaded');
    }

    // Upload to S3
    const s3Params = {
      Bucket: bucketName,
      Key: `uploads/${Date.now()}_${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const uploadResult = await s3.upload(s3Params).promise();

    // Create deal with file link from S3
    const deal = new Deal({
      userId,
      writerId,
      pages,
      totalPrice,
      userNotes,
      writerNotes,
      status,
      fileLinks: [uploadResult.Location], // save S3 URL as array
      submissionFiles: []
    });

    await deal.save();
    res.send('Deal created successfully with file!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating deal');
  }
});

export default router;
