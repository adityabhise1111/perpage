import mongoose from 'mongoose';
import {expressError} from '../utils/expressErrors.js';
import {asyncWrap} from '../utils/wrapAsync.js';
const connectDB = asyncWrap(async () => {
  try {
    console.log(process.env.MONGO_URL);
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    throw new expressError('mongodb connection failed' , 500);
  }
});

export default connectDB;
 