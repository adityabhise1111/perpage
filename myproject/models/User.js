import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: String, default: '' },
  role: {
    type: String,
    enum: ['user', 'writer', 'admin'],
    default: 'user'
  },
  bio: { type: String, default: '' },
  googleId: { type: String },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("User", UserSchema);

export { UserSchema, User };
