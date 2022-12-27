const { Server } = require("socket.io");
const logger = require("../utils/logger");
const storeMessage = require("../database/db.js");
require("dotenv").config();

const wsport = process.env.WS_PORT;

function start() {
	logger.info(`WebSocket-Server listening on port ${wsport}`);

	const io = new Server(wsport, {
		rejectUnauthorized: false,
		cors: {
			origin: "*",
		},
	});

	io.on("connection", function (socket) {
		socket.emit("message", "Welcome to the broom server!");

		socket.on("message", async (message) => {
			try {
				console.log({ message });
				// globally echo to all clients
				io.emit("message", message);
			} catch (error) {
				logger.info(error);
			}
		});

		// to emit to all clients
		socket.on("join", (community) => {
			console.log({ community });
			logger.info("A new user has joined the community!");
			io.emit("message", "A new user has joined the community!");
		});

		// TODO later disconnect
		// socket.disconnect();
	});
}

module.exports = start;
