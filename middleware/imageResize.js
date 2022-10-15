const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const outputFolder = "public/assets";

module.exports = async (req, res, next) => {
  const files = [];

  const resizePromises = req.files.map(async (file) => {
    await sharp(file.path)
      .resize(2000)
      .jpeg({ quality: 50 })
      .toFile(path.resolve(outputFolder, file.filename + "_full.jpg"));

    await sharp(file.path)
      .resize(100)
      .jpeg({ quality: 30 })
      .toFile(path.resolve(outputFolder, file.filename + "_thumb.jpg"));

    // fs.unlinkSync(file.path);

    files.push(file);
  });

  await Promise.all([...resizePromises]);

  req.files = files;
  console.log("images", files);

  next();
};

// module.exports = async (req, res, next) => {
//   console.log("resize file", req.files);
//   const files = [];

//   const resizePromises = req.files.map(async (file) => {
//     await sharp(file.buffer)
//       .resize(2000)
//       .jpeg({ quality: 50 })
//       .toFile(path.resolve(outputFolder, file.originalname + "_full.jpg"));

//     await sharp(file.buffer)
//       .resize(100)
//       .jpeg({ quality: 30 })
//       .toFile(path.resolve(outputFolder, file.originalname + "_thumb.jpg"));

//     fs.unlinkSync(file.buffer);

//     files.push(file);
//   });

//   await Promise.all([...resizePromises]);

//   req.files = files;
//   console.log("resized files", files);

//   next();
// };
