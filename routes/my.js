const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");

// const listingsStore = require("../store/listings");
const auth = require("../middleware/auth");
// const listingMapper = require("../mappers/listings");

router.get("/listings", auth, async (req, res) => {
  let user = req.user;
  console.log("listings' user", user);
  const listings = await Listing.find();
  listings.filter((listing) => listing.userId === req.user.userId);
  // const resources = listings.map(listingMapper);
  res.send(resources);
});

module.exports = router;
