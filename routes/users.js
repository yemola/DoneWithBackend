const express = require("express");
const router = express.Router();
const multer = require("multer");
const { s3UploadOne, s3Deletev2 } = require("./s3Service");
require("dotenv").config();
const DeletedListing = require("../models/DeletedListing");
const DeletedUser = require("../models/DeletedUser");
const Listing = require("../models/Listing");
const User = require("../models/User");
const UserOTPVerification = require("../models/UserOTPVerification");
const CryptoJS = require("crypto-js");
const yup = require("yup");
const validateWith = require("../middleware/validation");
const sgMail = require("@sendgrid/mail");
const errorHandler = require("../middleware/errorHandler");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

const emailSchema = yup.object().shape({
  email: yup.string().required().email().label("Email"),
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
router.post("/deleteUserAccount", async (req, res, next) => {
  const { userId } = req.body;

  try {
    let user = await User.findOne({ _id: userId });

    if (!user) return res.json("User already deleted");

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
    await newDelete.save();

    const userListings = await Listing.find({ userId });

    if (userListings) {
      for (listing of userListings) {
        try {
          await s3Deletev2(listing.images);
        } catch (error) {
          next(error);
        }
      }

      await Listing.deleteMany({ userId });
    }

    const result = await User.findByIdAndDelete(userId);
    if (!result) {
      return res.status(204).json({
        message: "User account deleted.",
      });
    } else {
      return res.status(204).end();
    }
  } catch (error) {
    next(error);
    // res.status(500).json({ message: "Internal server error", error });
  }
});

const upload = multer({
  dest: "profile/",
  fileFilter,
  limits: { fileSize: 10000000, fieldSize: 25 * 1024 * 1024, files: 5 },
});

//REGISTER / CREATE USER
router.post("/", validateWith(schema), async (req, res, next) => {
  console.log("body: ", body);
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

    const savedUser = await newUser.save();

    const regNotice = {
      to: "laflosd@gmail.com", // Change to your recipient
      from: process.env.AUTH_EMAIL, // Change to your verified sender
      subject: "New User Registered",
      text: "sorry about the stress, we understand",
      html: `<p>A new user with the details below has registered on JejeSales marketplace.</p>
               <p>Name: ${savedUser.firstname}
                  ${savedUser.lastname} </p>
                 <p>City: ${savedUser.city}</p>
                  <p>State: ${savedUser.state}</p>
                  <p>Country: ${savedUser.country}</p>`,
    };

    await sgMail
      .send(regNotice)
      .then(() => {
        res.json({
          status: "PENDING",
          message: "New user created",
          data: {
            userId: savedUer._id,
            email: savedUser.email,
          },
        });
      })
      .catch((error) => {
        next(error);
      });

    res.status(201).json(savedUser);
  } catch (err) {
    next(err);
  }
});

// confirm email
router.post(
  "/verifyEmail",
  validateWith(emailSchema),
  async (req, res, next) => {
    try {
      const userEmail = req.body.email.trim();

      let user = await User.findOne({ email: userEmail });
      if (!user)
        return res.json({
          status: "FAILED",
          message: "This email is not registered",
        });

      const { _id, email } = user;

      sendOTPMail({ _id, email }, res);
    } catch (error) {
      next(error);
    }
  }
);

// Send otp verification email
const sendOTPMail = async ({ _id, email }, res) => {
  try {
    const otp = `${Math.floor(100000 + Math.random() * 900000)}`;

    // SendGrid Code
    const msg = {
      to: email, // Change to your recipient
      from: process.env.AUTH_EMAIL, // Change to your verified sender
      subject: "Password Reset Pin",
      text: "sorry about the stress, we understand",
      html: `<p>Enter the <b>${otp}</b> in the app to verify your email addresss and complete the password reset process.</p><p>This code <b>expires in 1 hour<b/>.</p>`,
    };

    // //  Mail options
    // const mailOptions = {
    //   from: process.env.AUTH_EMAIL,
    //   to: email,
    //   subject: "Verify Your Email",
    //   html: `<p>Enter the <b>${otp}</b> in the app to verify your email addresss and complete the password reset process.</p><p>This code <b>expires in 1 hour<b/>.</p>`,
    // };

    // // Hash otp
    // const saltRounds = 10;

    // const hashedOTP = await bcrypt.hash(otp, saltRounds);

    const newOTPVerification = new UserOTPVerification({
      userId: _id,
      otp,
      createdAt: Date.now(),
      expiresAt: Date.now() + 3600000,
    });

    await newOTPVerification.save();

    // await transporter.sendMail(mailOptions);

    await sgMail
      .send(msg)
      .then(() => {
        res.json({
          status: "PENDING",
          message: "Verification otp email sent",
          data: {
            userId: _id,
            email,
          },
        });
      })
      .catch((error) => {
        next(error);
      });
  } catch (error) {
    next(error);
  }
};
// Verify otp email
router.post("/verifyOTP", async (req, res, next) => {
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
        const savedOTP = UserOTPRecords[0].otp;

        if (expiresAt < Date.now()) {
          // user otp record has expired
          await UserOTPVerification.deleteMany({ userId });
          throw new Error("Code has expired. Please request again.");
        } else {
          const validOTP = otp === savedOTP;

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
    next(error);
  }
});
// resend verification
router.post("/resendOTP", async (req, res, next) => {
  try {
    let { userId, email } = req.body;

    if (!userId || !email) {
      throw Error("Empty user details are not allowed.");
    } else {
      // delete existing records and resend
      await UserOTPVerification.deleteMany({ userId });
      sendOTPMail({ _id: userId, email }, res);
    }
  } catch (error) {
    next(error);
    // res.json({
    //   status: "FAILED",
    //   message: error.message,
    // });
  }
});

// update password
router.put("/resetPassword/:id", async (req, res, next) => {
  try {
    const { password, userId } = req.body;
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
    // res.json({
    //   status: "FAILED",
    //   message: error.message,
    // });
    next(error);
  }
});

// UPDATE USER INFO
router.put("/updateUser", async (req, res, next) => {
  const { userId } = req.body;

  try {
    const newUserDetails = await User.findByIdAndUpdate(
      { _id: userId },
      {
        _id: userId,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        username: req.body.username,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        countryCode: req.body.countryCode,
        whatsapp: req.body.whatsapp,
      },
      { new: true }
    );

    res.status(200).send(newUserDetails);
  } catch (err) {
    next(err);
    // res.status(500).json(err);
  }
});
//UPDATE
router.put(
  "/storetoken/:id",
  verifyTokenAndAuthorization,
  async (req, res, next) => {
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
      next(err);
      // res.status(500).json(err);
    }
  }
);

router.put(
  "/:id",
  [verifyTokenAndAuthorization, upload.single("image")],
  async (req, res, next) => {
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
      next(err);
      // res.status(500).json(err);
    }
  }
);

// DELETE A USER
router.post("/deleteUserAccount", async (req, res, next) => {
  const { userId } = req.body;

  try {
    let user = await User.findOne({ _id: userId });

    try {
      const delNotice = {
        to: "laflosd@gmail.com", // Change to your recipient
        from: process.env.AUTH_EMAIL, // Change to your verified sender
        subject: "User Account Deletion",
        text: "sorry about the stress, we understand",
        html: `<p>A user account is being deleted from JejeSales Marketplace. Below are the details of the user.</p>
                   <p>Name: ${user.firstname}
                      ${user.lastname} </p>
                     <p>City: ${user.city}</p>
                      <p>State: ${user.state}</p>
                      <p>Country: ${user.country}</p>`,
      };

      await sgMail.send(delNotice);
    } catch (error) {
      next(error);
    }

    if (!user) return res.json("User already deleted");
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

    const userListings = await Listing.find({ userId });

    for (listing of userListings) {
      try {
        const imgDel = await s3Deletev2(listing.images);

        res.status(204).json({ message: "listing images deleted." });
      } catch (error) {
        next(error);
        // res.status(404).json({ message: "listing images could not be found." });
      }
    }

    const response = await Listing.deleteMany({ userId });

    if (!response)
      res.status(204).json({ message: "Could not delete listings." });
    const result = await User.findByIdAndDelete(userId);
    if (!result)
      return res.status(204).json({
        message: "User account deleted.",
      });
  } catch (error) {
    next(error);
    // res.status(500).json({ message: "internal server error", error });
  }
});

//DELETE

router.delete("/:id", verifyTokenAndAuthorization, async (req, res, next) => {
  try {
    const userId = req.body.userId;

    await User.findByIdAndDelete(userId);
    res.status(200).json("User has been deleted...");
  } catch (err) {
    next(err);
    // res.status(500).json(err);
  }
});

//GET USER

router.get("/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (error) {
    next(error);
    // res.status(500).json(error);
  }
});

//GET ALL USER

router.get("/", verifyToken, async (req, res, next) => {
  const query = req.query.new;
  try {
    const users = query
      ? await User.find().sort({ _id: -1 })
      : await User.find();
    res.status(200).json(users);
  } catch (err) {
    next(err);
    // res.status(500).json("Error verifying token");
  }
});

//GET USER STATS

router.get("/stats", verifyTokenAndAdmin, async (req, res, next) => {
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
    next(err);
  }
});

router.use(errorHandler);

module.exports = router;
