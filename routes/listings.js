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

const storage = multer.memoryStorage({
  destination: function (req, file, callback) {
    callback(null, "");
  },
});

const filefilter = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else {
    cb(new Error("file is not of the correct type"), false);
  }
};

const upload = multer({
  storage,
  filefilter,
  limits: { fileSize: 10000000, fieldSize: 25 * 1024 * 1024, files: 5 },
});

//CREATE

router.post("/", [upload.array("images"), imageResize], async (req, res) => {
  // const data = req.files;
  // console.log("files", data);

  // const results = await s3Uploadv2(data);

  // try {
  // const data = await s3Uploadingv2();
  // return res.json({ status: "success" });
  // } catch (error) {
  //   res.json({ status: "upload failed" });
  // }

  // const listing = {
  //   title: req.body.title,
  //   price: parseFloat(req.body.price),
  //   categoryId: parseInt(req.body.categoryId),
  //   description: req.body.description,
  //   images: data.Location
  // };
  // listing.images = req.images.map((image) => ({ image: data.Location}));
  // if (req.body.location) listing.location = req.body.location;
  // if (req.user) listing.userId = req.user.userId;

  // if (error) {
  //   console.log("error: ", error);
  // } else {
  //   console.log("data link", data.Location);
  // }

  const listing = new Listing({
    title: req.body.title,
    price: parseFloat(req.body.price),
    categoryId: parseInt(req.body.categoryId),
    description: req.body.description,
    images: data.Location,
  });

  listing
    .save()
    .then((result) => {
      res.status(200).send({
        id: result._id,
        title: result.title,
        price: result.price,
        description: result.description,
        images: data.Location,
      });
    })
    .catch((err) => {
      res.status(500).json(err);
    });
  console.log("listing", listing);
  res.status(201).send(listing);
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
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json(err);
  }
});

// const upload = multer({
//   dest: "uploads/",
//   limits: { fieldSize: 25 * 1024 * 1024 },
// });

// const schema = yup.object().shape({
//   title: yup.string().required(),
//   description: yup.string(),
//   price: yup.number().required().min(1),
//   categoryId: yup.number().required().min(1),
//   location: yup
//     .object()
//     .shape({
//       latitude: yup.number(),
//       longitude: yup.number(),
//     })
//     .optional(),
// });

// const validateCategoryId = (req, res, next) => {
//   if (!categoriesStore.getCategory(parseInt(req.body.categoryId)))
//     return res.status(400).send({ error: "Invalid categoryId." });

//   next();
// };

// router.get("/", (req, res) => {
//   // console.log(req.params);
//   // const key = req.params.key;
//   // const readStream = getFileStream(key);

//   // readStream.pipe(res);
//   const listings = store.getListings();
//   const resources = listings.map(listingMapper);
//   res.send(resources);
// });

// router.post(
//   "/",
//   [
//     upload.array("images", config.get("maxImageCount")),
//     validateWith(schema),
//     validateCategoryId,
//     imageResize,
//   ],

// async (req, res) => {
//   const listing = {
//     title: req.body.title,
//     price: parseFloat(req.body.price),
//     categoryId: parseInt(req.body.categoryId),
//     description: req.body.description,
//   };
//   listing.images = req.images.map((fileName) => ({ fileName: fileName }));
//   if (req.body.location) listing.location = req.body.location;
//   if (req.user) listing.userId = req.user.userId;
//   const newListing = new Listing(req.body);

//   try {
//     const listing = await newListing.save();
//     res.status(200).json(listing);
//   } catch (err) {
//     res.status(500).json(err);
//   }
//   // store.addListing(listing);
//   // res.status(201).send(listing);
// };
// );

module.exports = router;
