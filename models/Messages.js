const mongoose = require("mongoose");

const MessagesSchema = new mongoose.Schema(
  {
    fromUserId: { type: String, required: true },
    toUserId: { type: String, required: true },
    listingId: { type: String },
    content: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Messages", MessagesSchema);
