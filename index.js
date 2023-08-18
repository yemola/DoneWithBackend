require("dotenv").config();
const cors = require("cors");
const express = require("express");
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");
const mongoose = require("mongoose");
const Sentry = require("@sentry/node");

// const categories = require("./routes/categories");
const faqsRoute = require("./routes/faqs");
const usersRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const categoriesRoute = require("./routes/categories");
const listingsRoute = require("./routes/listings");
const orderRoute = require("./routes/order");
const my = require("./routes/my");
const messages = require("./routes/messages");

const app = express();

Sentry.init({
  dsn: process.env.DSN,
  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

const mongoUrl = process.env.MONGO_URL;
mongoose
  .connect(mongoUrl)
  .then(() => console.log("DB Connected"))
  .catch((error) => console.log("error: ", error));

app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use(helmet());
app.use(compression());

app.use("/api/users", usersRoute);
app.use("/api/auth", authRoute);
app.use("/api/categories", categoriesRoute);
app.use("/api/faqs", faqsRoute);
app.use("/api/listings", listingsRoute);
app.use("/api/orders", orderRoute);

// app.use("/api/categories", categories);

app.use("/api/my", my);
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

const port = process.env.PORT;
app.listen(port, function () {
  console.log(`Server started on port ${port}...`);
});
