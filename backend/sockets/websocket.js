const { Server } = require("socket.io");
const logger = require("../utils/logger");
const storeMessage = require("../database/db.js");
const { isSocketAuthenticated } = require("../middleware");
require("dotenv").config();

const wsport = process.env.WS_PORT; // WEBSOCKET PORT

function start() {
	logger.info(`WebSocket-Server listening on port ${wsport}`);

	const io = new Server(wsport, {
		cors: {
			origin: "*",
		},
	});

	// add error handling to the connection event
	io.use(isSocketAuthenticated).on("connection", function (socket) {
		// Server happy and running
		io.emit("message", {
			text: `${socket?.userInfo?.username ?? "Anonymous"} has joined the chat!`,
			username: "Broom Bot",
		});

		socket.on("message", async (message) => {
			try {
				// store the message in the database
				await storeMessage(message);
				// globally echo to all clients
				io.emit("message", {
					text: message.text,
					username: socket?.userInfo?.username ?? "Anonymous",
				});
			} catch (error) {
				logger.error(error.toString());
			}
		});

		// Disconnect function
		socket.on("disconnect", () => {
			logger.info("Client disconnected");
		});
	});
}

module.exports = start;
