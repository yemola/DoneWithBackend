const express = require("express");
const router = express.Router();

const listingsStore = require("../store/listings");
const auth = require("../middleware/auth");
const listingMapper = require("../mappers/listings");

router.get("/listings", auth, (req, res) => {
  const listings = listingsStore.filterListings(
    (listing) => listing.userId === req.user.userId
  );
  const resources = listings.map(listingMapper);
  res.send(resources);
});

module.exports = router;

// {
//   "assetsBaseUrl": "https://donebucket1.s3.eu-central-1.amazonaws.com/",
//   "aws-bucket-name": "donebucket1",
//   "aws-bucket-region": "eu-central-1",
//   "aws-access-key": "AKIATFLS4RXOWQNHX6CD",
//   "aws-secret-key": "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",
//   "mongoUrl": "mongodb+srv://m001-student:m001-mongodb-basics@sandbox.yygdw.mongodb.net/DoneWithIt?retryWrites=true&w=majority",
//   "PASS_SEC": "yem223",
//   "JWT_SEC": "yem223",
//   "STRIPE_KEY": "sk_test_51KpDFcHMRCPcYjAQthN2GQRvpgnPmN3DildVoqm3RAR4Px65nB2lfkMOySxoIsrDtf54wdNaqiml68OW2OebCgoK00K95VZRgd"
// }
