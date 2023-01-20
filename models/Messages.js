const mongoose = require("mongoose");

const MessagesSchema = new mongoose.Schema({
  fromUserId: { type: String, required: true },
  toUserId: { type: String, required: true },
  listingId: { type: String },
  listItem: { type: String },
  content: { type: String },
  sender: { type: String },
  receiver: { type: String },
  senderImg: { type: String },
  receiverImg: { type: String },
  createdAt: { type: Date },
});

module.exports = mongoose.model("Messages", MessagesSchema);
