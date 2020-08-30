const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let Room = new Schema({
  roomId: { type: String, index: true },
  messages: [
    {
      socketId: {
        type: String,
      },
      nick: {
        type: String,
      },
      message: {
        type: String,
      },
    },
  ],
});

module.exports = mongoose.model("Room", Room);
