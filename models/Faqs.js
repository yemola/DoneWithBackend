const mongoose = require("mongoose");

const FaqsSchema = new mongoose.Schema(
  {
    num: { type: Number, required: true, unique: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Faqs", FaqsSchema);
