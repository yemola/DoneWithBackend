const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { s3Uploadv2, getFileStream } = require("../routes/s3Service");

const outputFolder = "public/assets";

module.exports = async (req, res, next) => {
  // const images = [];
  const files = req.files;
  console.log("files", files);
  try {
    const data = await s3Uploadv2(files);
    console.log("1st data", data);
    res.send({ message: "success" });
  } catch (err) {
    console.log(err);
  }

  req.images = data;

  // const images = [];
  // const resizePromises = req.files.map(async (file) => {
  //   await sharp(file.path)
  //     .resize(2000)
  //     .jpeg({ quality: 50 })
  //     .then(() => {
  //       const results = s3Uploadv2(req.files);
  //       console.log("2nd result", results);
  //       return res.send({ imagePath: `/${results.Key}` });

  //       // const results = s3Uploadv2(req.files);
  //       // console.log("results", results);
  //       // return res.json({ status: "success" });
  //     })
  //     .catch((err) => console.warn(err));

  //   await sharp(file.path)
  //     .resize(100)
  //     .jpeg({ quality: 30 })
  //     .then(() => {
  //       const results = s3Uploadv2(req.files);
  //       console.log("3rd result", results);
  //       return res.send({ imagePath: `/${results.Key}` });
  //       // const results = s3Uploadv2(req.files);
  //       // console.log("results", results);
  //       // return res.json({ status: "success" });
  //     })
  //     .catch((err) => console.warn(err));

  //   fs.unlinkSync(file.path);

  //   images.push(file.filename);
  // });

  // await Promise.all([...resizePromises]);

  // req.images = images;

  next();
};

// `/${results.Key
