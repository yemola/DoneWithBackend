const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

module.exports = async (req, res, next) => {
  const file = req.file;

  const resizePromise = async (file) => {
    await sharp(file.path).resize(360).jpeg({ quality: 50 });
    // .toFile(path.resolve(outputFolder, file.filename + "_full.jpg"));

    // fs.unlinkSync(file.path);
  };

  await resizePromise();

  req.file = file;

  next();
};
