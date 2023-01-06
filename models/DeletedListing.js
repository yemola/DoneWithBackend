const mongoose = require("mongoose");

const DeletedListingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String },
    images: { type: Array, required: true },
    categoryId: { type: Number },
    size: { type: Array },
    color: { type: Array },
    location: { type: Object },
    price: { type: String, required: true },
    userId: { type: String },
    userImg: { type: String },
    username: { type: String },
    state: { type: String },
    country: { type: String },
    countryCode: { type: Object },
    whatsapp: { type: String },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeletedListing", DeletedListingSchema);
