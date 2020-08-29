const axios = require("axios");
const { routes } = require("../routes");

const postRoom = (roomId) => {
  axios
    .post(routes.POST_ROOM(), roomId)
    .then((response) => console.log(response.statusText))
    .catch((error) => console.log(error.response.statusText));
};

const postMessage = (roomId, socketId, nick, message) => {
  axios
    .post(routes.POST_MESSAGE(roomId), { socketId, nick, message })
    .then((response) => console.log(response.statusText))
    .catch((error) => console.log(error.response.statusText));
};

exports.postRoom = postRoom;
exports.postMessage = postMessage;
