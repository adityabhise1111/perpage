import express from 'express';
import Deal from '../models/deal.js';
import { s3Client, bucketName } from '../config/s3.js';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const router = express.Router();

// Middleware to protect route
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

router.get('/',checkAuthenticated, async (req, res) => {
  try {
    const deals = await Deal.find().lean();

    // For each deal, replace file key with signed URL(s)
    for (const deal of deals) {
      if (deal.fileLinks && deal.fileLinks.length > 0) {
        deal.signedLinks = [];

        for (const key of deal.fileLinks) {
          const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
          });

          const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 * 5 }); // 5 min
          deal.signedLinks.push(signedUrl);
        }
      } else {
        deal.signedLinks = [];
      }
    }

    res.render('dashboard', { deals });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).send('Error loading dashboard');
  }
});

export default router;
