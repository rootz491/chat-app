const http = require("http");
const { Server } = require("socket.io");
const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");
const storeMessage = require("../database/db.js");
require("dotenv").config();

const wsport = process.env.WS_PORT; // WEBSOCKET PORT
const SECRET_KEY = process.env.JWT_SECRET; // SECRET KEY

function start() {
  logger.info(`WebSocket-Server listening on port ${wsport}`);

  const server = http.createServer();
  const io = new Server(server, {
    rejectUnauthorized: false,
    cors: {
      origin: "*",
    },
  });

  // add error handling to the connection event
  io.on("connection", function (socket) {
    // verify the JWT in the query string
    const { token } = socket.handshake.query;
    if (!token) {
      return socket.disconnect(true); // disconnect the socket if no token is provided
    }
    try {
      // decode and verify with jwt key
      const payload = jwt.verify(token, SECRET_KEY);
      // use payload for perms
      console.log(payload);
    } catch (error) {
      return socket.disconnect(true); // disconnect
    }

    // Server happy and running
    socket.emit("message", "Welcome to the Broom server!");

    socket.on("message", async (message) => {
      try {
        console.log({ message });
        // store the message in the database
        await storeMessage(socket, message);
        // globally echo to all clients
        io.emit("message", message);
      } catch (error) {
        logger.info(error);
      }
    });
    
    socket.on("getInitialMessages", (callback) => {
      // Get the initial messages from the database
      const initialMessages = getMessagesFromDatabase();
      // Send a response with the initial messages
      callback({ messages: initialMessages });
    });
    
    // Emit to all clients
    socket.on("join", (community) => {
      console.log({ community });
      logger.info("A new user has joined the community!");
      io.emit("message", "A new user has joined the community!");
    });

    // Disconnect function
    socket.on("disconnect", () => {
      console.log("Client disconnected");
      // add logging here later
    });
  });

  // error handling
  server.on("error", (error) => {
    if (error.syscall !== "listen") {
      throw error;
    }

    const bind = typeof wsport === "string" ? "Pipe " + wsport : "Port " + wsport;

    // error handling part 2
    switch (error.code) {
      case "EACCES":
        console.error(bind + " requires elevated privileges");
        process.exit(1);
        break;
      case "EADDRINUSE":
        console.error(bind + " is already in use");
        process.exit(1);
        break;
      default:
        throw error;
    }
  });

  server.listen(wsport);
}

module.exports = start;