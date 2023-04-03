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

router.post("/", async (req, res) => {
  try {
    const newCategory = new Categories({
      backgroundColor: req.body.backgroundColor,
      icon: req.body.icon,
      label: req.body.label,
      value: parseInt(req.body.value),
    });

    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
