const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const imageResize = require("../middleware/imageResize");
const multer = require("multer");
const listingMapper = require("../mappers/listings");
const { s3Uploadv2, getFileStream } = require("./s3Service");

const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

// const storage = multer.memoryStorage({
//   destination: function (req, file, callback) {
//     callback(null, "");
//   },
// });

const fileFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else {
    cb(new Error("file is not of the correct type"), false);
  }
};

const upload = multer({
  dest: "uploads/",
  fileFilter,
  limits: { fileSize: 10000000, fieldSize: 25 * 1024 * 1024, files: 5 },
});

// const upload = multer({
//   storage,
//   filefilter,
//   limits: { fileSize: 10000000, fieldSize: 25 * 1024 * 1024, files: 5 },
// });

//CREATE

router.post("/", [upload.array("images"), imageResize], async (req, res) => {
  const files = req.files;
  console.log("resized files", files);

  const data = await s3Uploadv2(files);
  console.log("result in s3", data);

  const listing = new Listing({
    title: req.body.title,
    price: parseFloat(req.body.price),
    categoryId: parseInt(req.body.categoryId),
    description: req.body.description,
    images: data.map((image) => ({
      url: `${image.Location}`,
      thumbnailUrl: `${image.Location}`,
    })),
  });

  if (req.body.location) listing.location = JSON.parse(req.body.location);
  // if (req.user) listing.userId = req.user.userId;

  listing
    .save()
    .then((result) => {
      res.status(200).send({
        _id: result._id,
        title: result.title,
        price: result.price,
        description: result.description,
        images: data.map((image) => ({
          url: `${image.Location}`,
          thumbnailUrl: `${image.Location}`,
        })),
      });
    })
    .catch((err) => {
      console.log("error", err);
      // return res.status(500).json(err);
    });

  console.log("listing", listing);
  // return res.status(201).send(listing);
});

//UPDATE
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedListing);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE

router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json("Product has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET PRODUCT

router.get("/:id", async (req, res) => {
  try {
    const item = await Listing.findById(req.params.id);
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL PRODUCTS

router.get("/", async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.categoryId;
  try {
    let items;

    if (qNew) {
      items = await Listing.find().sort({ createdAt: -1 }).limit(1);
    } else if (qCategory) {
      items = await Listing.find({
        categoryId: {
          $in: [qCategory],
        },
      });
    } else {
      items = await Listing.find();
      console.log("items", items); // items to get
    }
    // const resources = items.map(listingMapper);
    res.status(200).json(items);
  } catch (err) {
    console.log("resource error", err);
    // res.status(500).json(err);
  }
});

module.exports = router;
