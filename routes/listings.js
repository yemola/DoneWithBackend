const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const imageResize = require("../middleware/imageResize");
const multer = require("multer");
const { s3Uploadv2, s3Deletev2 } = require("./s3Service");
const auth = require("../middleware/auth");

const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");

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

//CREATE

router.post("/", [upload.array("images"), imageResize], async (req, res) => {
  const files = req.files;

  const data = await s3Uploadv2(files);

  const listing = new Listing({
    title: req.body.title,
    price: req.body.price,
    categoryId: parseInt(req.body.categoryId),
    description: req.body.description,
    userId: req.body.userId,
    userImg: req.body.userImg,
    username: req.body.username,
    state: req.body.state,
    country: req.body.country,
    countryCode: req.body.countryCode,
    whatsapp: req.body.whatsapp,
    images: data.map((image) => ({
      url: `${image.Location}`,
      thumbnailUrl: `${image.Location}`,
    })),
  });

  if (req.body.location) listing.location = JSON.parse(req.body.location);

  listing
    .save()
    .then((result) => {
      res.status(200).send({
        _id: result._id,
        title: result.title,
        price: result.price,
        userId: result.userId,
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

//DELETE A LISTING

router.delete("/:id", verifyToken, async (req, res) => {
  // const files = req.files;
  // console.log("files to delete: ", files);

  try {
    // await s3Deletev2(files);
    // console.log("s3Delete: ", s3Deletev2(files));
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json("Product has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETING SOME LISTINGS

router.delete("/deleteListings", verifyToken, async (req, res) => {
  console.log("reqquery: ", req.query);
  const user = JSON.parse(req.query.user);
  const userId = user.userId;
  console.log("userId todelete: ", userId);

  try {
    for (let listing of myListings) {
      await Listing.findByIdAndDelete(listing._id);
    }
    console.log("successfully deleted", res.data);
  } catch (error) {
    console.log("listings deletion failed", error);
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

//GET MY PRODUCTs

// router.post("/mylistings", async (req, res) => {
//   console.log("reqbodyMY: ", req.body);
//   let { userId } = req.body;
//   const myListings = await Listing.find({ userId });
//   console.log("myListings: ", myListings);
//   res.send(resources);
// });

router.post("/getSum", async (req, res) => {
  try {
    const userId = req.body.userId;
    const myListings = await Listing.find({ userId });
    const myListingsSum = myListings.length;
    console.log("listingSum: ", myListingsSum);
    res.json({
      status: "SUCCESS",
      message: "Total items sent",
      data: {
        myListingsSum,
      },
    });
  } catch (error) {
    console.log("error getting sum of listing: ", error);
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
      // console.log("items", items); // items to get
    }
    res.status(200).json(items);
  } catch (err) {
    console.log("resource error", err);
    // res.status(500).json(err);
  }
});

module.exports = router;
