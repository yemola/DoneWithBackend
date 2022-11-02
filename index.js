require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const categories = require("./routes/categories");
// const config = require("config");
const usersRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const listingsRoute = require("./routes/listings");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
const stripeRoute = require("./routes/stripe");
const userRoute = require("./routes/user");
const my = require("./routes/my");
const messages = require("./routes/messages");
const expoPushTokens = require("./routes/expoPushTokens");
const helmet = require("helmet");
const compression = require("compression");
const mongoose = require("mongoose");
const { config } = require("dotenv");

// app.use((_, res, next) => {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PUT, PATCH, DELETE"
//   );
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   next();
// });

const mongoUrl = process.env.MONGO_URL || config.get("mongoUrl");
mongoose
  .connect(mongoUrl)
  .then(() => console.log("DB Connected"))
  .catch((error) => console.log("error: ", error));

app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use(helmet());
app.use(compression());

app.use("/api/user", userRoute);
app.use("/api/users", usersRoute);
app.use("/api/auth", authRoute);
app.use("/api/listings", listingsRoute);
app.use("/api/carts", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/checkout", stripeRoute);

app.use("/api/categories", categories);

app.use("/api/my", my);
app.use("/api/expoPushTokens", expoPushTokens);
app.use("/api/messages", messages);

const port = process.env.PORT;
app.listen(port, function () {
  console.log(`Server started on port ${port}...`);
});

// app.get("/api/genres", (req, res) => {
//   res.send(genres);
// });

// app.get("/api/genres/:id", (req, res) => {
//   const genre = genres.find((g) => g.id === parseInt(req.params.id));
//   if (!genre) return res.status(404).send("Genre with the given ID not found");
//   res.status(200).send(genre);
// });

// app.post("/api/genres", (req, res) => {
//   const schema = Joi.Object({
//     genre: Joi.string().min(4).max(12).required(),
//   });
//   Joi.validate(req.body, schema);
//   const genre = {
//     id: genres.length + 1,
//     name: req.body.name,
//   };
//   genres.push(genre);
//   res.status(200).send(genre);
// });

// app.put("/api/genres", (req, res) => {
//   const genre = genres.find((g) => g.id === parseInt(req.params.id));
//   if (!genre) return res.status(404).send("Genre with the given ID not found");
// });
