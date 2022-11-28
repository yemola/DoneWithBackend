const express = require("express");
const router = express.Router();
const config = require("config");
const multer = require("multer");
const validateWith = require("../middleware/validation");
const resizeOne = require("../middleware/resizeOne");
const { s3UploadOne } = require("./s3Service");

const User = require("../models/User");

module.exports = router;

// const usersStore = require("../store/users");
// const listingsStore = require("../store/listings");
// const auth = require("../middleware/auth");

// router.get("/:id", auth, (req, res) => {
//   const userId = parseInt(req.params.id);
//   const user = usersStore.getUserById(userId);
//   if (!user) return res.status(404).send();

//   const listings = listingsStore.filterListings(
//     listing => listing.userId === userId
//   );

//   res.send({
//     id: user.id,
//     name: user.name,
//     email: user.email,
//     listings: listings.length
//   });
// });
