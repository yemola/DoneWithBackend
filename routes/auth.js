const express = require("express");
const router = express.Router();
const yup = require("yup");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const validateWith = require("../middleware/validation");
const errorHandler = require("../middleware/errorHandler");

const schema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required().min(5),
});

//LOGIN

router.post("/", validateWith(schema), async (req, res, next) => {
  const query1 = req.body.username;
  const query2 = req.body.email;
  try {
    const user = query2
      ? await User.findOne({ email: query2 })
      : await User.findOne({ username: query1 });
    !user && res.status(401).json("Wrong username or email!");
    if (!user && !req.body.password) return;
    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );
    const Originalpassword = hashedPassword.toString(CryptoJS.enc.Utf8);
    Originalpassword !== req.body.password &&
      res.status(401).json("Wrong password!");

    const { password, ...others } = user._doc;

    const token = jwt.sign(
      {
        firstname: user.firstname,
        lastname: user.lastname,
        userId: user._id,
        username: user.username,
        email: user.email,
        city: user.city,
        state: user.state,
        country: user.country,
        countryCode: user.countryCode,
        whatsapp: user.whatsapp,
        image: user.image,
        isAdmin: user.isAdmin,
        expoPushToken: user.expoPushToken,
      },
      process.env.JWT_SEC
      //
    );
    res.status(200).json(token);
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
