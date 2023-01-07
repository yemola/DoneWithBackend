const express = require("express");
const router = express.Router();
const yup = require("yup");
const { Expo } = require("expo-server-sdk");

const User = require("../models/User");
const Listing = require("../models/Listing");
const Messages = require("../models/Messages");
const sendPushNotification = require("../utilities/pushNotifications");
const auth = require("../middleware/auth");
const validateWith = require("../middleware/validation");

const schema = yup.object().shape({
  listingId: yup.number().required(),
  message: yup.string().required(),
});

router.get("/", auth, async (req, res) => {
  try {
    const resources = await Messages.find();
    res.status(200).send(resources);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/", [auth, validateWith(schema)], async (req, res) => {
  const { listingId, message } = req.body;

  const listing = Listing.findById(listingId);
  if (!listing) return res.status(400).send({ error: "Invalid listingId." });

  const targetUser = User.findById(listing.userId);
  if (!targetUser) return res.status(400).send({ error: "Invalid userId." });

  const newMessage = new Messages({
    fromUserId: req.user.userId,
    toUserId: listing.userId,
    content: message,
  });

  const { expoPushToken } = targetUser;

  if (Expo.isExpoPushToken(expoPushToken))
    await sendPushNotification(expoPushToken, newMessage);

  res.status(201).send();
});

module.exports = router;
