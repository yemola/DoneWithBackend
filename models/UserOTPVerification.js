const mongoose = require("mongoose");

const UserOTPVerificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  otp: { type: String, required: true, unique: true },
  createdAt: { type: Date },
  expiresAt: { type: Date },
});

module.exports = mongoose.model(
  "UserOTPVerification",
  UserOTPVerificationSchema
);
