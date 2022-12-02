const express = require("express");
const router = express.Router();
const multer = require("multer");
const { s3UploadOne } = require("./s3Service");

const User = require("../models/User");
const CryptoJS = require("crypto-js");
const config = require("config");
const yup = require("yup");
const validateWith = require("../middleware/validation");

const schema = yup.object().shape({
  username: yup.string().required().min(2),
  email: yup.string().email().required(),
  password: yup.string().required().min(5),
});

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
  dest: "profile/",
  fileFilter,
  limits: { fileSize: 10000000, fieldSize: 25 * 1024 * 1024, files: 5 },
});

//REGISTER
router.post("/", async (req, res) => {
  let savedUser;
  let newUser = new User({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    username: req.body.username,
    email: req.body.email,
    city: req.body.city,
    state: req.body.state,
    country: req.body.country,
    whatsapp: req.body.whatsapp,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString(),
  });
  try {
    savedUser = await newUser.save();
    res.status(201).send(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE
router.put("/storetoken/:id", verifyTokenAndAuthorization, async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString();
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        whatsapp: req.body.whatsapp,
        password: req.body.password,
        image: req.body.image,
        isAdmin: req.body.isAdmin,
        expoPushToken: req.body.token,
      },
      { new: true }
    );

    res.status(200).send(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put(
  "/:id",
  [verifyTokenAndAuthorization, upload.single("image")],
  async (req, res) => {
    if (req.body.password) {
      req.body.password = CryptoJS.AES.encrypt(
        req.body.password,
        process.env.PASS_SEC
      ).toString();
    }

    const file = req.file;
    const data = await s3UploadOne(file);

    const newImage = data.Location;

    result = await User.findById(req.params.id);

    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          username: req.body.username,
          city: req.body.city,
          state: req.body.state,
          country: req.body.country,
          whatsapp: req.body.whatsapp,
          password: req.body.password,
          image: newImage,
          isAdmin: req.body.isAdmin,
          expoPushToken: req.body.token,
        },
        { new: true }
      );

      res.status(200).send(updatedUser);
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

//DELETE

router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json("User has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER

router.get("/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL USER

router.get("/", verifyTokenAndAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const users = query
      ? await User.find().sort({ _id: -1 }).limit(5)
      : await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER STATS

router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
