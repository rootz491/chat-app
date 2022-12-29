// const http = require("http");
const { Server } = require("socket.io");
const logger = require("../utils/logger");
const storeMessage = require("../database/db.js");
const { isSocketAuthenticated } = require("../middleware");
require("dotenv").config();

const wsport = process.env.WS_PORT; // WEBSOCKET PORT

function start() {
	logger.info(`WebSocket-Server listening on port ${wsport}`);

	// const server = http.createServer(); //	NOTE:  Not sure why http server is here, so I commented it out for now
	// const io = new Server(server, {
	const io = new Server(wsport, {
		cors: {
			origin: "*",
		},
	});

	// add error handling to the connection event
	io.use(isSocketAuthenticated).on("connection", function (socket) {
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
	// server.on("error", (error) => {
	// 	if (error.syscall !== "listen") {
	// 		throw error;
	// 	}

	// 	const bind =
	// 		typeof wsport === "string" ? "Pipe " + wsport : "Port " + wsport;

	// 	// error handling part 2
	// 	switch (error.code) {
	// 		case "EACCES":
	// 			console.error(bind + " requires elevated privileges");
	// 			process.exit(1);
	// 			break;
	// 		case "EADDRINUSE":
	// 			console.error(bind + " is already in use");
	// 			process.exit(1);
	// 			break;
	// 		default:
	// 			throw error;
	// 	}
	// });

	// server.listen(wsport);
}

module.exports = start;
