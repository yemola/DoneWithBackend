const express = require("express");
const router = express.Router();
const Faqs = require("../models/Faqs");
const errorHandler = require("../middleware/errorHandler");

// FETCH ALL

router.get("/", async (req, res, next) => {
  try {
    const faqs = await Faqs.find();

    res.status(200).send(faqs);
  } catch (error) {
    next(error);
    // res.status(400).json(error);
  }
});

// ADD NEW FAQ

router.post("/", async (req, res, next) => {
  try {
    const faqNum = req.body.num;
    const faqNumExist = await Faqs.findOne({ num: faqNum });
    if (faqNumExist) return res.send("FAQ already exist");
    const newFaq = new Faqs({
      num: req.body.num,
      question: req.body.question,
      answer: req.body.answer,
    });

    const savedFaq = await newFaq.save();

    res.status(201).json(savedFaq);
  } catch (error) {
    next(error);
    // res.status(500).json(error);
  }
});

// UPDATE FAQ

router.put("/updateFaq", async (req, res, next) => {
  const faqNum = req.body.num;

  try {
    const faqToUpdate = await Faqs.findOne({ num: faqNum });
    const faqId = faqToUpdate._id;
    const updatedFaq = await Faqs.findByIdAndUpdate(
      { _id: faqId },
      {
        _id: faqId,
        num: req.body.num,
        question: req.body.question,
        answer: req.body.answer,
      },
      { new: true }
    );

    res.status(200).send(updatedFaq);
  } catch (error) {
    next(error);
  }
});

router.use(errorHandler);

module.exports = router;
