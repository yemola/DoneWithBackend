const express = require("express");
const categories = require("./routes/categories");

const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const listingsRoute = require("./routes/listings");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
const stripeRoute = require("./routes/stripe");
// const user = require("./routes/user");
const my = require("./routes/my");
const messages = require("./routes/messages");
const expoPushTokens = require("./routes/expoPushTokens");
const helmet = require("helmet");
const compression = require("compression");
const config = require("config");
const app = express();
const mongoose = require("mongoose");
const multer = require("multer");

const mongoUrl = config.get("mongoUrl");
mongoose
  .connect(mongoUrl)
  .then(() => console.log("DB Connected"))
  .catch((error) => console.log("error: ", error));

app.use(express.static("public"));
app.use(express.json());
app.use(helmet());
app.use(compression());

app.use(express.json());
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/listings", listingsRoute);
app.use("/api/carts", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/checkout", stripeRoute);

app.use("/api/categories", categories);

app.use("/api/my", my);
app.use("/api/expoPushTokens", expoPushTokens);
app.use("/api/messages", messages);

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.json({
        message: "file is too large",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.json({
        message: "too many files at once",
      });
    }
  }
});

// app.post("/images", upload.single("image"), async (req, res) => {
//   const file = req.file;
//   console.log(file);
//   const result = await uploadFile(file);
//   console.log(result);
//   const description = req.body.description;
//   res.send("");
// });

const port = config.get("port");
app.listen(port, function () {
  console.log(`Server started on port ${port}...`);
});
