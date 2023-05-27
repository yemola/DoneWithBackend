const express = require("express");
const router = express.Router();
const Listing = require("../models/Listing");
const imageResize = require("../middleware/imageResize");
const multer = require("multer");
const { s3Uploadv2, s3Deletev2 } = require("./s3Service");
const errorHandler = require("../middleware/errorHandler");

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
  limits: { fileSize: 10000000, fieldSize: 25 * 1024 * 1024, files: 6 },
});

//CREATE

router.post(
  "/",
  [upload.array("images"), imageResize],
  async (req, res, next) => {
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
          categoryId: result.categoryId,
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
        next(err);
      });
    // return res.status(201).send(listing);
    // url: `${cloudFrontUrl}/${image.key}`,
    //         thumbnailUrl: `${cloudFrontUrl}/${image.key}`,
  }
);

//UPDATE LISTING

router.put("/updateListing", async (req, res, next) => {
  const listingId = req.body._id;

  try {
    const updatedListing = await Listing.findByIdAndUpdate(
      { _id: listingId },
      {
        _id: listingId,
        title: req.body.title,
        price: req.body.price,
        description: req.body.description,
        categoryId: req.body.category.value,
      },
      { new: true }
    );

    res.status(200).send(updatedListing);
  } catch (error) {
    next(error);
  }
});

//UPDATE
// router.put("/:id", async (req, res, next) => {
//   try {
//     const updatedListing = await Listing.findByIdAndUpdate(
//       req.params.id,
//       {
//         $set: req.body,
//       },
//       { new: true }
//     );
//     res.status(200).json(updatedListing);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

//DELETE A LISTING

router.delete("/:id", verifyToken, async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    const response = await s3Deletev2(listing.images);
  } catch (error) {
    next(error);
  }

  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json("Product has been deleted...");
  } catch (err) {
    next(err);
  }
});

//DELETING SOME LISTINGS

// router.delete("/deleteListings", verifyToken, async (req, res, next) => {
//   const user = JSON.parse(req.query.user);
//   const userId = user.userId;
//   console.log("body: ", req.body);

//   for (let listing of myListings) {
//     const response = await s3Deletev2(listing.images);
//     console.log("deleteResponse: ", response);
//   }

// try {
//   for (let listing of myListings) {
//     await Listing.findByIdAndDelete(listing._id);
//   }
//   res.status(200).json("Successfully deleted");
// } catch (error) {
//   res.status(400).json("listings deletion failed", error);
// }
// });

//GET PRODUCT

router.get("/:id", async (req, res, next) => {
  try {
    const item = await Listing.findById(req.params.id);
    res.status(200).json(item);
  } catch (err) {
    next(err);
    // res.status(500).json(err);
  }
});

//GET MY PRODUCTs

// router.post("/mylistings", async (req, res, next) => {
//   console.log("reqbodyMY: ", req.body);
//   let { userId } = req.body;
//   const myListings = await Listing.find({ userId });
//   console.log("myListings: ", myListings);
//   res.send(resources);
// });

router.post("/getSum", async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const myListings = await Listing.find({ userId });
    const myListingsSum = myListings.length;

    res.json({
      status: "SUCCESS",
      message: "Total items sent",
      data: {
        myListingsSum,
      },
    });
  } catch (error) {
    next(error);
    // res.status(400).json(error);
  }
});

//GET ALL PRODUCTS

router.get("/", async (req, res, next) => {
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
    next(err);
  }
});

router.use(errorHandler);

module.exports = router;
