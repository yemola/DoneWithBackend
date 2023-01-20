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
  listingId: yup.string().required(),
  message: yup.string().required(),
});

router.post("/getUserChats", async (req, res) => {
  const userId = req.body.userId;

  try {
    const resources = await Messages.find({ userId });

    res.status(200).send(resources);
  } catch (error) {
    res.status(400).json(error);
  }
});

router.post("/addNewChat", async (req, res) => {
  const { newChat } = req.body;
  const chat = new Messages({
    fromUserId: newChat.fromUserId,
    toUserId: newChat.toUserId,
    listingId: "",
    listItem: "",
    content: newChat.content,
    sender: newChat.sender,
    receiver: newChat.receiver,
    senderImg: newChat.senderImg,
    receiverImg: newChat.receiverImg,
    createdAt: newChat.createdAt,
  });

  const targetUser = await User.findById(savedChat.toUserId);

  try {
    const savedChat = await chat.save();

    if (!targetUser) return res.status(400).json({ status: "FAILED" });

    const { expoPushToken } = targetUser;

    if (Expo.isExpoPushToken(expoPushToken))
      await sendPushNotification(expoPushToken, savedChat);

    res.status(200).json(savedChat);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/", validateWith(schema), async (req, res) => {
  const { listingId, message, user } = req.body;

  const listing = await Listing.findById(listingId);

  if (!listing)
    return res.status(400).send({ status: "FAILED", message: error.message });

  const targetUser = await User.findById(listing.userId);

  if (!targetUser)
    return res.status(400).json({ status: "FAILED", message: error.message });

  const newMessage = new Messages({
    fromUserId: user.userId,
    toUserId: listing.userId,
    listingId: listingId,
    listItem: listing.title,
    content: message,
    sender: `${user.firstname} ${user.lastname}`,
    receiver: `${targetUser.firstname} ${targetUser.lastname}`,
    senderImg: user.image,
    receiverImg: targetUser.image,
    createdAt: Date.now(),
  });
  await newMessage.save();

  const { expoPushToken } = targetUser;

  if (Expo.isExpoPushToken(expoPushToken))
    await sendPushNotification(expoPushToken, newMessage);

  res.status(201).send("Message sent successfully.");
});

module.exports = router;
