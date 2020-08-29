const mongoose = require("mongoose");

const server = require("./services/server");
const initSocket = require("./services/socket");
const db = require("./services/mongodb");

const ADDRESS = process.env.ADDRESS;
const PORT = process.env.PORT;
server.listen(PORT, () => console.log(`Listening on ${ADDRESS}:${PORT}`));
initSocket();
