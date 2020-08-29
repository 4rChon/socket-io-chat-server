const express = require("express");
const https = require("http");
const fs = require("fs");
const cors = require("cors");

const options = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.pem"),
  requestCert: false,
  rejectUnauthorized: false,
};

const { router } = require("../routes/index");
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(router);
const server = https.createServer(options, app);

module.exports = server;
