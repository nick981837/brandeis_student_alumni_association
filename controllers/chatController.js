const Message = require("../models/message");

module.exports = (io) => {
  io.on("connection", (client) => {
    // Event handler for client disconnection
    client.on("disconnect", () => {
      client.broadcast.emit("user disconnected");
    });
    // Event handler for receiving messages from clients
    client.on("message", (data) => {
      let messageAttributes = {
        content: data.content,
        userName: data.userName,
        user: data.userId,
      };
      // Saving the message to the database
      Message.create(messageAttributes)
        .then(() => {
          io.emit("message", messageAttributes);
        })
        .catch((error) => {
          console.log(`error: ${error.message}`);
        });
    });
    // Loading the last 20 messages on client connection
    Message.find({})
      .sort({ createdAt: -1 })
      .limit(20)
      .then((messages) => {
        client.emit("load all messages", messages.reverse());
      });
  });
};
