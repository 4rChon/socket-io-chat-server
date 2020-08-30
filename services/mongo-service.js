const mongoose = require("mongoose");
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.8uqdg.gcp.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`;
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  autoIndex: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {});

module.exports = db;

const Room = require("../models/room");

const createRoom = async (roomId) => {
  await Room.findOneAndUpdate(
    { roomId: roomId },
    { roomId: roomId },
    { upsert: true }
  ).exec();
};

const createMessage = async (roomId, socketId, nick, message) => {
  const room = await Room.findOneAndUpdate(
    { roomId },
    {
      $push: { messages: { socketId, nick, message } },
    }
  ).exec();
};

const readMessageCount = async (roomId) => {
  return await Room.aggregate()
    .match({ roomId: roomId })
    .project({
      messageCount: { $size: { $ifNull: ["$messages", []] } },
    })
    .exec();
};

const readMessages = async (roomId) => {
  const room = await Room.findOne({ roomId }).exec();
  return room.messages;
};

const readMessagesSlice = async (roomId, offset, size) => {
  const room = await Room.findOne({ roomId }).exec();
  offset = room.messages.length - offset;
  return room.messages.slice(Math.max(offset - size, 0), offset);
};

const readRooms = async () => {
  return await Room.find().exec();
};

const readRoom = async (roomId) => {
  return await Room.findOne({ roomId }).exec();
};

module.exports = {
  createRoom,
  createMessage,
  readMessageCount,
  readMessages,
  readMessagesSlice,
  readRoom,
  readRooms,
};
