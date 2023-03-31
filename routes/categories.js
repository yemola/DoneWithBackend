const express = require("express");
const router = express.Router();
const Categories = require("../models/Categories");

router.get("/", async (req, res) => {
  try {
    const categories = await Categories.find();

    res.status(200).send(categories);
  } catch {
    res.status(400).json(error);
  }
});

module.exports = router;
