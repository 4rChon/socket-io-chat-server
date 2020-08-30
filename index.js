const server = require("./services/server");
const initSocket = require("./services/socket");

const ADDRESS = process.env.ADDRESS;
const PORT = process.env.PORT;
server.listen(PORT, () => console.log(`Listening on ${ADDRESS}:${PORT}`));
initSocket();
