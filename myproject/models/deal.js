import mongoose from "mongoose";

const dealSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  writerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileLinks: {
    type: [String], // PDF/image URLs stored in Firebase or AWS
    default: []
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in-progress', 'submitted', 'completed', 'rejected'],
    default: 'pending'
  },
  pages: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  userNotes: {
    type: String,
    default: ''
  },
  writerNotes: {
    type: String,
    default: ''
  },
  submissionFiles: {
    type: [String], // Writer submits finished work (again, stored externally)
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: Date,
  completedAt: Date
});

const Deal = mongoose.model('Deal', dealSchema);

export default Deal;
