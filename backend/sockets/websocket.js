const { Server } = require("socket.io");
const logger = require("../utils/logger");
const storeMessage = require("../database/db.js");
require("dotenv").config();

const wsport = process.env.WS_PORT;

function start() {
	logger.info(`WebSocket-Server listening on port ${wsport}`);

	const io = new Server(httpServer, {
		cors: {
			origin: "*",
		},
	});

	io.on("connection", function (socket) {
		socket.emit("message", "Welcome to the broom server!");

		socket.on("message", async (message) => {
			try {
				const parsedMessage = JSON.parse(message);
				await storeMessage(parsedMessage);
				socket.emit("message", "Message received!");
			} catch (error) {
				logger.info(error);
			}
		});

		// to emit to all clients
		socket.on("join", (community) => {
			console.log(community);
			io.emit("message", "A new user has joined the community!");
		});

		// TODO later disconnect
		// socket.disconnect();
	});
}

module.exports = start;
