const { Expo } = require("expo-server-sdk");

const sendPushNotification = async (targetExpoPushToken, message) => {
  const expo = new Expo();
  let messages = [];

  for (let pushToken of somePushTokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      continue;
    }
    // { to: targetExpoPushToken, sound: "default", body: message },
    messages.push({
      to: targetExpoPushToken,
      sound: "default",
      body: message,
      data: { withSome: "data" },
    });
  }
  let chunks = expo.chunkPushNotifications(messages);
  let tickets = [];

  const sendChunks = async () => {
    // This code runs synchronously. We're waiting for each chunk to be send.
    // A better approach is to use Promise.all() and send multiple chunks in parallel.
    chunks.forEach(async (chunk) => {
      console.log("Sending Chunk", chunk);
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log("TicketChunk", ticketChunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.log("Error sending chunk", error);
      }
    });
  };

  await sendChunks();

  let receiptIds = [];

  for (let ticket of tickets) {
    if (ticket.id) {
      receiptIds.push(ticket.id);
    }
  }

  let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  (async () => {
    for (let chunk of receiptIdChunks) {
      try {
        let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        console.log(receipts);

        for (let receiptId in receipts) {
          let { status, message, details } = receipts[receiptId];
          if (status === "ok") {
            continue;
          } else if (status === "error") {
            console.error(
              `There was an error sending a notification: ${message}`
            );
            if (details && details.error) {
              console.error(`The error code is ${details.error}`);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  })();
};

module.exports = sendPushNotification;
