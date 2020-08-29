const express = require("express");
const router = express.Router();

const Room = require("../models/room");

const url = `http://${process.env.ADDRESS}:${process.env.PORT}`;
const routes = {
  INDEX: () => `${url}/`,
  GET_ROOMS: () => `${url}/rooms/`,
  GET_ROOM: (roomId) => `${url}/rooms/${roomId}/`,
  GET_MESSAGES: (roomId) => `${url}/rooms/${roomId}/messages/`,
  POST_ROOM: () => `${url}/rooms`,
  POST_MESSAGE: (roomId) => `${url}/rooms/${roomId}/messages/`,
};

router.get("/", (req, res) => {
  res.send({ response: "What's up my dude" }).status(200);
});

router.get("/rooms/", (req, res) => {
  Room.find({}, (err, rooms) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.send(rooms.map((r) => r.roomId));
    }
  });
});

router.get("/rooms/:roomId/", (req, res) => {
  Room.findOne({ roomId: req.params.roomId }, (err, room) => {
    if (err) {
      res.send(err);
    } else {
      if (!room) {
        res.send({});
      } else {
        res.send(room);
      }
    }
  });
});

router.get("/rooms/:roomId/messages/", (req, res) => {
  Room.findOne({ roomId: req.params.roomId }, (err, room) => {
    if (err) {
      res.send(err);
    } else {
      if (!room) {
        res.send([]);
      } else {
        res.send(room.messages);
      }
    }
  });
});

router.get("/rooms/:roomId/messages/:offset/:size", (req, res) => {
  Room.findOne({ roomId: req.params.roomId }, (err, room) => {
    if (err) {
      res.send(err);
    } else {
      if (!room) {
        res.send([]);
      } else {
        const offset = room.messages.length - parseInt(req.params.offset);
        const size = parseInt(req.params.size);

        res.send(room.messages.slice(offset - size, offset));
      }
    }
  });
});

router.post("/rooms/", (req, res) => {
  if (!("roomId" in req.body)) {
    res.send("No id specified");
    return;
  }
  Room.findOne({ roomId: req.body.roomId }, function (err, room) {
    if (err) {
      res.send(err);
      return;
    } else if (room) {
      res.send({ response: "Room already exists" });
      return;
    }
  });

  Room.create({ roomId: req.body.roomId, messages: [] }, function (err, room) {
    if (err) {
      res.send(err);
    } else {
      res.send({ response: `New room created` });
    }
  });
});

router.post("/rooms/:roomId/messages/", (req, res) => {
  Room.findOne({ roomId: req.params.roomId }, (err, room) => {
    if (err) {
      res.send(err);
    } else {
      if (!room) {
        room = new Room({
          roomId: req.params.roomId,
          messages: [req.body],
        });
      } else {
        room.messages.push(req.body);
      }

      room.save();
      res.send({ response: "Message added" }).status(200);
    }
  });
});

exports.routes = routes;
exports.router = router;
