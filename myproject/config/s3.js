// firebase/s3.js
import AWS from 'aws-sdk';

const bucketName = 'perpagedb';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
  bucketName: process.env.AWS_BUCKET_NAME
});

export { s3, bucketName };
