const express = require("express");
const router = express.Router();
const multer = require("multer");
const { s3UploadOne } = require("./s3Service");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
require("dotenv").config();
const DeletedListing = require("../models/DeletedListing");
const DeletedUser = require("../models/DeletedUser");
const Listing = require("../models/Listing");
const User = require("../models/User");
const UserOTPVerification = require("../models/UserOTPVerification");
const CryptoJS = require("crypto-js");
// const config = require("config");
const yup = require("yup");
const validateWith = require("../middleware/validation");

const schema = yup.object().shape({
  firstname: yup.string().required().label("First Name"),
  lastname: yup.string().required().label("Last Name"),
  username: yup.string().required().label("Username"),
  city: yup.string().label("City"),
  state: yup.string().required().label("State"),
  country: yup.string().required().label("Country"),
  countryCode: yup.object().label("Country Code"),
  email: yup.string().required().email().label("Email"),
  password: yup.string().required().min(4).label("Password"),
  whatsapp: yup.string().label("WhatsApp Number"),
});

// Nodemailer Transporter
let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

// Testing Success
transporter.verify((error, success) => {
  if (error) {
    console.log("Verification error: ", error);
  } else {
    console.log("Ready for messages");
    console.log("Success");
  }
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
router.post("/", validateWith(schema), async (req, res) => {
  let newUser = new User({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    username: req.body.username,
    email: req.body.email,
    city: req.body.city,
    state: req.body.state,
    country: req.body.country,
    countryCode: req.body.countryCode,
    whatsapp: req.body.whatsapp,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString(),
  });

  try {
    let checkedEmail = await User.findOne({ email: req.body.email });
    if (checkedEmail)
      return res
        .status(401)
        .json("Email already registered. Use another email address");
    // const savedUser =
    await newUser.save().then((savedUser) => {
      // Handle account verification
      // sendVerificationEmail(savedUser, res);
      sendOTPMail(savedUser, res);
    });
    // res.status(201).json(savedUser);
  } catch (err) {
    console.log("error: ", err);
    // res.status(500).json(err);
  }
});

// // Send verification email
// const sendVerificationEmail = ({ _id, email }) => {
//   // url to be used in the email
//   const currentUrl = "http://192.168.43.60:9001/";

//   const uniqueString = uuidv4() + _id;

//   // mail options
//   const mailOptions = {
//     from: process.env.AUTH_EMAIL,
//     to: email,
//     subject: "Verify Your Email",
//     html: `<p>Please verify your email address to complete the signup and login into your account.</p> <p>This link <b>expires in 6 hours</b>.</p> <p>Press <a href=${
//       currentUrl + "user/verify/" + _id + "/" + uniqueString
//     }>here</a> to proceed.</p>`,
//   };

//   // hash the uniqueString
//   const hashedUniqueString = CryptoJS.AES.encrypt(
//     uniqueString,
//     process.env.PASS_SEC
//   ).toString();

//   const newVerification = new UserVerification({
//     userId: _id,
//     uniqueString: hashedUniqueString,
//     createdAt: Date.now(),
//     expiresAt: Date.now() + 21600000,
//   });

//   newVerification
//     .save()
//     .then(() => {
//       transporter
//         .sendMail(mailOptions)
//         .then(() => {
//           res.json({
//             status: "PENDING",
//             message: "Verification email sent",
//           });
//         })
//         .catch((error) => {
//           console.log(error);
//           res.json({
//             status: "FAILED",
//             message: "Verification email failed",
//           });
//         });
//     })
//     .then()
//     .catch((error) => {
//       console.log(error);
//       res.json({
//         status: "FAILED",
//         message: "Couldn't save verification email data!",
//       });
//     });
// };

// // Verify Email
// router.get("/verify/:userId/:uniqueString", (req, res) => {
//   let { userId, uniqueString } = req.params;

//   UserVerification.find({ userId })
//     .then()
//     .catch((error) => {
//       console.log(error);
//     });
// });

// confirm email
router.post("/verifyEmail", async (req, res) => {
  try {
    const userEmail = req.body.email;
    let user = await User.findOne({ email: userEmail });
    const { _id, email } = user;

    sendOTPMail({ _id, email }, res);
  } catch (error) {
    console.log("Error: ", error);
  }
});

// Send otp verification email
const sendOTPMail = async ({ _id, email }, res) => {
  try {
    const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
    console.log("otp: ", otp);

    // Mail options
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Verify Your Email",
      html: `<p>Enter the <b>${otp}</b> in the app to verify your email addresss and complete the password reset process.</p><p>This code <b>expires in 1 hour<b/>.</p>`,
    };

    // Hash otp
    const saltRounds = 10;

    const hashedOTP = await bcrypt.hash(otp, saltRounds);

    const newOTPVerification = new UserOTPVerification({
      userId: _id,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });

    await newOTPVerification.save();

    await transporter.sendMail(mailOptions);

    res.json({
      status: "PENDING",
      message: "Verification otp email sent",
      data: {
        userId: _id,
        email,
      },
    });
  } catch (error) {
    console.log("Email error: ", error);
    res.json({
      status: "FAILED",
      message: error.message,
    });
  }
};
// Verify otp email
router.post("/verifyOTP", async (req, res) => {
  try {
    let { userId, otp } = req.body;

    if (!userId || !otp) {
      throw Error("Empty otp details are not allowed");
    } else {
      const UserOTPRecords = await UserOTPVerification.find({ userId });
      if (UserOTPRecords.length <= 0) {
        // no record found
        throw new Error(
          "Account record doesn't exist or has been verified already. Please sign up or log in."
        );
      } else {
        // user otp record exists
        const { expiresAt } = UserOTPRecords[0];
        const hashedOTP = UserOTPRecords[0].otp;

        if (expiresAt < Date.now()) {
          // user otp record has expired
          await UserOTPVerification.deleteMany({ userId });
          throw new Error("Code has expired. Please request again.");
        } else {
          const validOTP = await bcrypt.compare(otp, hashedOTP);

          if (!validOTP) {
            // supplied otp is wrong
            throw new Error("Invalid code passed. Check your inbox.");
          } else {
            // success
            await User.updateOne({ _id: userId }, { verified: true });
            await UserOTPVerification.deleteMany({ userId });
            res.json({
              status: "VERIFIED",
              message: "User email verified successfully.",
            });
          }
        }
      }
    }
  } catch (error) {
    res.json({
      status: "FAILED",
      message: error.message,
    });
  }
});
// resend verification
router.post("/resendOTP", async (req, res) => {
  try {
    console.log("resend reqBody: ", req.body);
    let { userId, email } = req.body;

    if (!userId || !email) {
      throw Error("Empty user details are not allowed.");
    } else {
      // delete existing records and resend
      await UserOTPVerification.deleteMany({ userId });
      sendOTPMail({ _id: userId, email }, res);
    }
  } catch (error) {
    res.json({
      status: "FAILED",
      message: error.message,
    });
  }
});

// update password
router.put("/resetPassword/:id", async (req, res) => {
  try {
    console.log("reqBody: ", req.body);
    const { password, userId } = req.body;
    console.log("userIdNewPassword: ", userId, password);
    const user = await User.findOne({ _id: userId });
    const updatedUser = await User.findByIdAndUpdate(
      { _id: userId },
      {
        _id: userId,
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        city: user.city,
        state: user.state,
        country: user.country,
        countryCode: user.countryCode,
        whatsapp: user.whatsapp,
        password: CryptoJS.AES.encrypt(
          password,
          process.env.PASS_SEC
        ).toString(),
        image: user.image,
        isAdmin: user.isAdmin,
        expoPushToken: user.expoPushToken,
      },
      { new: true }
    );

    res.status(200).send(updatedUser);
  } catch (error) {
    console.log("Error updating password: ", error);

    res.json({
      status: "FAILED",
      message: error.message,
    });

    // res.status(500).json(error);
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
        countryCode: req.body.countryCode,
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
          countryCode: req.body.countryCode,
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

// DELETE A USER
router.post("/deleteUserAccount", async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findOne({ _id: userId });

    if (!user) res.json("User already deleted");
    let newDelete = new DeletedUser({
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      city: user.city,
      state: user.state,
      country: user.country,
      countryCode: user.countryCode,
      email: user.email,
      password: user.password,
      whatsapp: user.whatsapp,
      image: user.image,
      isAdmin: user.isAdmin,
      verified: user.verified,
      expoPushToken: user.expoPushToken,
    });
    const deletedUser = await newDelete.save();
    console.log("deletedUser: ", deletedUser);

    const response = await Listing.deleteMany({ userId });
    response === "null"
      ? console.log("listings deleted")
      : console.log("not deleted: ", response.problem);

    const result = await User.findByIdAndDelete(userId);
    if (result === "null")
      res.json({
        status: "SUCCESS",
        message: "User account deleted.",
      });
  } catch (error) {
    console.log("error deleting user: ", error);
  }
});

//DELETE

router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const userId = req.body.userId;
    console.log("user Id: ", userId);
    await User.findByIdAndDelete(userId);
    res.status(200).json("User has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (error) {
    res.status(500).json(error);
  }
});

//GET ALL USER

router.get("/", verifyToken, async (req, res) => {
  const query = req.query.new;
  try {
    const users = query
      ? await User.find().sort({ _id: -1 })
      : await User.find();
    res.status(200).json(users);
  } catch (err) {
    console.log("users: ", users);
    // res.status(500).json(err);
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
