const express = require("express");
const router = express.Router();
// const jwt = require("jsonwebtoken");
const User = require("../models/User");
const CryptoJS = require("crypto-js");
const config = require("config");
// const yup = require("yup");
// const usersStore = require("../store/users");
// const validateWith = require("../middleware/validation");

//REGISTER
router.post("/register", async (req, res) => {
  const newUser = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString(),
  });

  try {
    const user = await newUser.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// const schema = yup.object().shape({
//   name: yup.string().required().min(2),
//   email: yup.string().email().required(),
//   password: yup.string().required().min(5),
// });

// router.post("/", validateWith(schema), (req, res) => {
//   const { name, email, password } = req.body;
//   if (usersStore.getUserByEmail(email))
//     return res
//       .status(400)
//       .send({ error: "A user with the given email already exists." });

//   const user = { name, email, password };
//   usersStore.addUser(user);

//   res.status(201).send(user);
// });

// router.get("/", (req, res) => {
//   res.send(usersStore.getUsers());
// });

module.exports = router;
