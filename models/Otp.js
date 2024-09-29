const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expirationTime: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300,  // Optional: automatically delete the document after 5 minutes (300 seconds)
  },
});

const Otp = mongoose.model('Otp', OtpSchema);

module.exports = Otp;
