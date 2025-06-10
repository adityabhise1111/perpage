import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { s3Client, bucketName } from '../config/s3.js';
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import Deal from '../models/deal.js';
import { User } from '../models/User.js';

const router = express.Router();

// 🔒 Middleware to ensure user is authenticated
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

// 📁 Multer setup - in-memory storage for AWS S3
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB
});


router.post('/upload-final', checkAuthenticated, upload.single('finalPdf'), async (req, res) => {
  try {
    const { dealId } = req.body;
    const file = req.file;

    if (!file || !dealId) {
      return res.status(400).send('Missing file or deal ID');
    }

    const deal = await Deal.findById(dealId);
    if (!deal) return res.status(404).send('Deal not found');

    const finalFileKey = `finals/${Date.now()}_${file.originalname}`;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: finalFileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    await s3Client.send(command);

    // Generate signed URL for secure download
    const signedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({ Bucket: bucketName, Key: finalFileKey }),
      { expiresIn: 60 * 60 * 24 * 7 }
    );

    deal.finalFileLink = signedUrl;
    await deal.save();

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Final file upload error:', err);
    res.status(500).send('Error uploading final file');
  }
});


// 📄 GET /deal?writerId=xxx
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
      userId: req.user._id,
      userName: req.user.name
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// 📨 POST /deal - Create new deal and upload initial file
router.post('/', checkAuthenticated, upload.single('file'), async (req, res) => {
  try {
    const {
      userId, writerId, pages, totalPrice,
      userNotes, writerNotes, status
    } = req.body;

    if (!userId || !writerId || !pages || !totalPrice) {
      return res.status(400).send("Missing required fields");
    }

    const file = req.file;
    if (!file) return res.status(400).send('No file uploaded');

    // ✅ Upload to S3
    const fileKey = `uploads/${Date.now()}_${file.originalname}`;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    await s3Client.send(command);

    // 💾 Save deal
    const deal = new Deal({
      userId: new mongoose.Types.ObjectId(userId),
      writerId: new mongoose.Types.ObjectId(writerId),
      pages,
      totalPrice,
      userNotes,
      writerNotes,
      status,
      fileLinks: [fileKey],
      submissionFiles: [],
      finalFileLink: null
    });

    await deal.save();
    res.redirect('/dashboard');
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).send('Failed to create deal');
  }
});

// 📤 POST /deal/upload-final - Upload final file by writer
router.post('/upload-final', checkAuthenticated, upload.single('finalPdf'), async (req, res) => {
  try {
    const { dealId } = req.body;
    const file = req.file;

    if (!file || !dealId) {
      return res.status(400).send('Missing file or deal ID');
    }

    const deal = await Deal.findById(dealId);
    if (!deal) return res.status(404).send('Deal not found');

    const finalFileKey = `finals/${Date.now()}_${file.originalname}`;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: finalFileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });
    await s3Client.send(command);

    // 🔗 Generate signed download URL valid for 7 days
    const signedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({ Bucket: bucketName, Key: finalFileKey }),
      { expiresIn: 60 * 60 * 24 * 7 }
    );

    deal.finalFileLink = signedUrl;
    await deal.save();

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Final file upload error:', err);
    res.status(500).send('Error uploading final file');
  }
});

// ✅ Accept deal
router.post('/accept/:id', checkAuthenticated, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).send('Deal not found');

    deal.status = 'accepted';
    await deal.save();
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error accepting deal');
  }
});

// ❌ Reject deal
router.post('/reject/:id', checkAuthenticated, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) return res.status(404).send('Deal not found');

    deal.status = 'rejected';
    await deal.save();
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error rejecting deal');
  }
});

export default router;
