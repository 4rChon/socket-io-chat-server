const router = require("express").Router();
const mongoService = require("../services/mongo-service");

const url = `http://${process.env.ADDRESS}:${process.env.PORT}`;
const routes = {
  INDEX: () => `${url}/`,
  GET_ROOMS: () => `${url}/rooms/`,
  GET_ROOM: (roomId) => `${url}/rooms/${roomId}/`,
  GET_MESSAGES: (roomId) => `${url}/rooms/${roomId}/messages/`,
  POST_ROOM: () => `${url}/rooms`,
  POST_MESSAGE: (roomId) => `${url}/rooms/${roomId}/messages/`,
};

const handleError = (err, res, status = 500) => {
  console.log(err);
  res.sendStatus(status);
};

router.get("/", (req, res) => {
  res.send({ response: "What's up my dude" }).status(200);
});

router.get("/rooms/", async (req, res) => {
  try {
    const rooms = await mongoService.readRooms();
    res.send(rooms.map((r) => r.roomId)).status(200);
  } catch (err) {
    handleError(err, res);
  }
});

router.get("/rooms/:roomId/", async (req, res) => {
  try {
    const room = await mongoService.readRoom(req.params.roomId);
    res.send(room).status(200);
  } catch (err) {
    handleError(err, res);
  }
});

router.get("/rooms/:roomId/messageCount/", async (req, res) => {
  try {
    const messageCount = await mongoService.readMessageCount(req.params.roomId);
    res.send(messageCount[0]).status(200);
  } catch (err) {
    handleError(err, res);
  }
});

router.get("/rooms/:roomId/messages/", async (req, res) => {
  try {
    const messages = await mongoService.readMessages(req.params.roomId);
    res.send(messages).status(200);
  } catch (err) {
    handleError(err, res);
  }
});

router.get("/rooms/:roomId/messages/:offset/:size", async (req, res) => {
  try {
    const messages = await mongoService.readMessagesSlice(
      req.params.roomId,
      parseInt(req.params.offset),
      parseInt(req.params.size)
    );
    res.send(messages).status(200);
  } catch (err) {
    handleError(err, res);
  }
});

exports.routes = routes;
exports.router = router;
