const mongoose = require("mongoose");

const CategoriesSchema = new mongoose.Schema({
  backgroundColor: { type: String, required: true },
  icon: {
    type: String,
    required: true,
  },

  label: { type: String, required: true },
  value: { type: Number, required: true },
});

module.exports = mongoose.model("Categories", CategoriesSchema);
