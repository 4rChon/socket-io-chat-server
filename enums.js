const RequestType = {
  MESSAGE: "MSG",
  COMMAND: "CMD",
  GET: "GET",
  POST: "POST",
};

const Request = {
  GET_ROOMS: "GET_ROOMS_RQ",
  GET_USERS: "GET_USERS_RQ",
  SET_NICK: "NICK",
  JOIN_ROOM: "JOIN",
  LEAVE_ROOM: "LEAVE",
  TYPING: "TYPE_RQ",
};

const Response = {
  TYPING: "TYPE_RS",
  MESSAGE: "MSG_RS",
  SET_NICK: "SET_NICK_RS",
  SET_ROOM: "SET_ROOM_RS",
  SET_ID: "SET_ID_RS",
  BAD_CMD: "BAD_CMD_RS",
  DELETE_ROOM: "DEL_ROOM_RS",
  UPDATE_ROOM: "UPD_ROOM_RS",
  GET_ROOMS: "GET_ROOMS_RS",
  GET_USERS: "GET_USERS_RS",
  DELETE_USER: "DEL_USER_RS",
  ADD_USER: "ADD_USER_RS",
  UPDATE_USER: "UPD_USER_RS",
};

exports.RequestType = RequestType;
exports.Request = Request;
exports.Response = Response;
