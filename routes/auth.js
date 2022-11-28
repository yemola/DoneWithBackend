const express = require("express");
const router = express.Router();
const yup = require("yup");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const validateWith = require("../middleware/validation");
const config = require("config");

const schema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required().min(5),
});

//LOGIN

router.post("/", validateWith(schema), async (req, res) => {
  const query1 = req.body.name;
  const query2 = req.body.email;
  try {
    const user = query2
      ? await User.findOne({ email: query2 })
      : await User.findOne({ name: query1 });
    !user && res.status(401).json("Wrong name or email!");

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
        userId: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
        isAdmin: user.isAdmin,
        expoPushToken: user.expoPushToken,
      },
      process.env.JWT_SEC,
      { expiresIn: "5d" }
    );

    res.status(200).json(token);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
