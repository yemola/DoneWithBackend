const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");

const auth = require("../middleware/auth");

router.get("/listings", auth, async (req, res) => {
  let user = req.user;
  const listings = await Listing.find();
  listings.filter((listing) => listing.userId === req.user.userId);

  res.send(resources);
});

module.exports = router;
