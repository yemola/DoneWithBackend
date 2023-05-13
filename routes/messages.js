const express = require("express");
const router = express.Router();
const yup = require("yup");
const { Expo } = require("expo-server-sdk");
// const redis = require("redis");
// const client = redis.createClient();

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

router.post("/delete", async (req, res) => {
  try {
    const chatsToDelete = req.body.selectedItems;

    console.log("chat: ", chatsToDelete);

    if (chatsToDelete.length === 1) {
      const [chatId] = chatsToDelete;

      await Messages.findByIdAndDelete({ _id: chatId });
    }
    if (chatsToDelete.length > 1) {
      const result = await chatsToDelete.forEach(async (delChat) => {
        await Messages.findByIdAndDelete(delChat);
      });
    }
    res.status(200).json("Deleted");
  } catch (error) {
    res.status(500).json(error);
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
    createdDate: newChat.date,
    createdTime: newChat.time,
    status: newChat.status,
  });

  try {
    const savedChat = await chat.save();

    const targetUser = await User.findById(savedChat.toUserId);

    if (!targetUser) return res.status(400).json({ status: "FAILED" });

    const { expoPushToken } = targetUser;

    const { toUserId: userId } = savedChat;
    console.log("userId: ", userId);

    if (Expo.isExpoPushToken(expoPushToken))
      await sendPushNotification(expoPushToken, savedChat);

    // const incrementNotificationCount = (userId) => {
    //   client.incr('notification-count:${userId}');
    // }

    res.status(200).json(savedChat);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/getTotalNumOfChats", async (req, res) => {
  console.log("reqBody: ", req.body);
  const { userId } = req.body;

  try {
    const count = await Messages.countDocuments({
      toUserId: userId,
      status: "sent",
    });
    console.log("count: ", count);
    if (count) res.status(200).json({ count });
  } catch (error) {
    console.log("error: ", error);
    res.status(400).json(error);
  }
});

router.put("/updateChats", async (req, res) => {
  try {
    const result = await Messages.updateMany(
      { _id: { $in: req.body } },
      { $set: { status: "read" } }
    );
    console.log("result: ", result);
    res.status(200).json(result);
  } catch (error) {
    console.log("err: ", error);
    res.status(400).json(error);
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
  let now = new Date();
  const month = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
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
    createdAt: new Date(),
    createdDate: `${
      month[now.getUTCMonth()]
    } ${now.getDate()}, ${now.getFullYear()}`,
    createdTime: `${now.getHours()}:${now.getMinutes()}`,
    status: "sent",
  });
  await newMessage.save();

  const { expoPushToken } = targetUser;

  if (Expo.isExpoPushToken(expoPushToken))
    await sendPushNotification(expoPushToken, newMessage);

  res.status(201).send("Message sent successfully.");
});

module.exports = router;
