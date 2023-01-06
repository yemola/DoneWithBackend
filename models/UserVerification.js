const mongoose = require("mongoose");

const UserVerificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  uniqueString: { type: String, required: true, unique: true },
  createdAt: { type: Date },
  expiresAt: { type: Date },
});

module.exports = mongoose.model("UserVerification", UserVerificationSchema);
