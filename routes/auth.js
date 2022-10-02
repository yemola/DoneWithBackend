const express = require("express");
const router = express.Router();
const yup = require("yup");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const config = require("config");
const validateWith = require("../middleware/validation");

const schema = yup.object().shape({
  email: yup.string().email().required(),
  password: yup.string().required().min(5),
});

//REGISTER
router.post("/register", validateWith(schema), async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      config.get("PASS_SEC")
    ).toString(),
  });

  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }

  // const token = jwt.sign(
  //   { userId: user.id, name: user.name, email },
  //   "jwtPrivateKey"
  // );
  // res.send(token);
});

//LOGIN

router.get("/login", validateWith(schema), async (req, res) => {
  const query1 = req.body.username;
  const query2 = req.body.email;
  try {
    const user = query1
      ? await User.findOne({ username: query1 })
      : await User.findOne({ email: query2 });
    !user && res.status(401).json("Wrong username or email!");

    const hashedPassword = CryptoJS.AES.decrypt(
      user.password,
      process.env.PASS_SEC
    );
    const Originalpassword = hashedPassword.toString(CryptoJS.enc.Utf8);
    Originalpassword !== req.body.password &&
      res.status(401).json("Wrong password!");

    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      config.get("JWT_SEC"),
      { expiresIn: "5d" }
    );

    const { password, ...others } = user._doc;

    res.status(200).json({ ...others, accessToken });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
