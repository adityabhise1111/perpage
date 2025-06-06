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

router.get('/', checkAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    // 1. Deals where user is the WRITER (incoming work)
    const writerDeals = await Deal.find({ writerId: userId })
      .populate('userId', 'name') // populate client info
      .lean();

    // 2. Deals where user is the CLIENT (outgoing deals)
    const clientDeals = await Deal.find({ userId: userId })
      .populate('writerId', 'name profilePic') // populate writer info
      .lean();

    // Function to generate signed URLs
    async function addSignedUrlsToDeals(deals) {
      for (const deal of deals) {
        deal.signedLinks = [];

        if (deal.fileLinks && deal.fileLinks.length > 0) {
          for (const key of deal.fileLinks) {
            const command = new GetObjectCommand({
              Bucket: bucketName,
              Key: key,
            });

            const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 * 5 });
            deal.signedLinks.push(signedUrl);
          }
        }
      }
    }

    // Add signed URLs
    await addSignedUrlsToDeals(writerDeals);
    await addSignedUrlsToDeals(clientDeals);

    // Render dashboard
    res.render('dashboard', { writerDeals, clientDeals });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).send('Error loading dashboard');
  }
});

export default router;
