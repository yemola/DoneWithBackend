const express = require("express");
const router = express.Router();
const Categories = require("../models/Categories");
const errorHandler = require("../middleware/errorHandler");

router.get("/", async (req, res, next) => {
  try {
    const categories = await Categories.find();

    res.status(200).send(categories);
  } catch (error) {
    next(error);
    // res.status(400).json(error);
  }
});

router.post("/", async (req, res, next) => {
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
    next(error);
    // res.status(500).json(error);
  }
});

router.use(errorHandler);

module.exports = router;
