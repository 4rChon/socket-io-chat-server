const socketIo = require("socket.io");
const mongoService = require("./mongo-service");
const server = require("./server");
const { RequestType, Request, Response } = require("../enums");
const ADDRESS = process.env.ADDRESS;
const PORT = process.env.PORT;

const io = socketIo(
  server
  //   {
  //   handlePreflightRequest: (req, res) => {
  //     const headers = {
  //       "Access-Control-Allow-Headers": "*",
  //       "Access-Control-Allow-Origin": `https://${ADDRESS}:${PORT}/`,
  //       "Access-Control-Request-Method": "*",
  //       "Access-Control-Allow-Credentials": true,
  //     };
  //     res.writeHead(200, headers);
  //     res.end();
  //   },
  // }
);

let userList = {};
let roomList = {};
let typists = {};

let userIdCount = 0;

const messageRoom = (roomId, message) => {
  //DAL.createMessage(roomId, "SERVER", "SERVER", message).then(() =>
  io.in(roomId).emit(Response.MESSAGE, { nick: "SERVER", message: message });
  //);
};

const log = (roomId = "", msg = "Message not set.") => {
  if (roomId.length > 0) {
    messageRoom(roomId, msg);
  }
};

const setNick = (socket, nick, log) => {
  const msg = `${userList[socket.id].nick} set his name to ${nick}.`;

  userList[socket.id].nick = nick;
  socket.emit(Response.SET_NICK, nick);
  io.emit(Response.UPDATE_USER, userList[socket.id]);

  if (log) log(userList[socket.id].roomId, msg);
};

const leaveRoom = (socket, roomId, log) => {
  socket.leave(roomId);
  if (roomList[roomId].length == 0) {
    io.emit(Response.DELETE_ROOM, roomId);
    delete roomList[roomId];
  } else {
    io.emit(Response.UPDATE_ROOM, { [roomId]: roomList[roomId] });
  }

  if (log) {
    log(roomId, `${userList[socket.id].nick} has left ${roomId}.`);
  }
};

const setRoom = (socket, roomId, log) => {
  Object.keys(socket.rooms)
    .filter((roomId) => roomId != socket.id)
    .map((roomId) => leaveRoom(socket, roomId, log));

  mongoService
    .createRoom(roomId)
    .then(() => {
      if (roomId.length > 0) {
        socket.join(roomId);
        roomList[roomId] = io.sockets.adapter.rooms[roomId];
      }

      userList[socket.id].roomId = roomId;
      socket.emit(Response.SET_ROOM, roomId);
      if (roomId.length > 0) {
        io.emit(Response.UPDATE_ROOM, { [roomId]: roomList[roomId] });
      }
      io.emit(Response.UPDATE_USER, userList[socket.id]);

      if (log) {
        log(roomId, `${userList[socket.id].nick} joined #${roomId}.`);
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const onMessage = (socket, data) => {
  mongoService
    .createMessage(data.roomId, socket.id, data.nick, data.message)
    .then(() => io.in(data.roomId).emit(Response.MESSAGE, data));
};

const onCommand = (socket, commands) => {
  switch (commands[0]) {
    case Request.SET_NICK:
      if (commands.length != 2) break;
      setNick(socket, commands[1], log);
      break;
    case Request.JOIN_ROOM:
      if (commands.length != 2) break;
      setRoom(socket, commands[1], log);
      break;
    case Request.LEAVE_ROOM:
      if (commands.length != 1) break;
      setRoom(socket, "", log);
      break;
    default:
      console.log(`Bad command: ${commands}`);
      socket.emit(Response.BAD_CMD, "SERVER: No matching command.");
      break;
  }
};

const onGet = (socket, request) => {
  switch (request) {
    case Request.GET_ROOMS:
      socket.emit(Response.GET_ROOMS, roomList);
      break;
    case Request.GET_USERS:
      socket.emit(Response.GET_USERS, Object.values(userList));
      break;
    default:
      console.log(`Bad request: ${request}`);
      socket.emit(Response.BAD_CMD, "SERVER: No matching request.");
      break;
  }
};

const updateTypists = (id, nick, roomId, isTyping) => {
  let changed = false;
  if (isTyping) {
    if (!(roomId in typists)) {
      changed = true;
      typists[roomId] = {
        [id]: { id, nick },
      };
    } else if (!(id in typists[roomId])) {
      changed = true;
      typists[roomId][id] = { id, nick };
    }
  } else if (roomId in typists && id in typists[roomId]) {
    changed = true;
    delete typists[roomId][id];
  }
  if (changed) {
    io.in(roomId).emit(Response.TYPING, Object.values(typists[roomId]));
  }
};

const onPost = (socket, request, data) => {
  switch (request) {
    case Request.TYPING:
      updateTypists(socket.id, data.nick, data.roomId, data.typing);
  }
};

const initSocket = () => {
  io.on("connection", (socket) => {
    socket.on("disconnect", () => {
      const roomId = userList[socket.id].roomId;
      updateTypists(socket.id, userList[socket.id].nick, roomId, false);
      messageRoom(roomId, `${userList[socket.id].nick} left #${roomId}.`);
      io.emit(Response.UPDATE_ROOM, { [roomId]: roomList[roomId] });
      io.emit(Response.DELETE_USER, socket.id);
      delete userList[socket.id];
      console.log("Client disconnected");
    });

    socket.on(RequestType.COMMAND, (commands) => onCommand(socket, commands));
    socket.on(RequestType.MESSAGE, (data) => onMessage(socket, data));
    socket.on(RequestType.GET, (request) => onGet(socket, request));
    socket.on(RequestType.POST, ([request, data]) =>
      onPost(socket, request, data)
    );

    console.log("Client connected");
    userList[socket.id] = { id: socket.id, nick: socket.id, roomId: "Common" };
    socket.emit(Response.SET_ID, socket.id);
    setNick(socket, `anon${++userIdCount}`);
    setRoom(socket, "Common", log);
    io.emit(Response.ADD_USER, userList[socket.id]);
  });

  return io;
};

module.exports = initSocket;
