const WebSocket = require("ws");
const logger = require("../utils/logger");
const storeMessage = require("../database/db.js");
require("dotenv").config();

const wsport = process.env.WS_PORT;

const wss = new WebSocket.Server({ port: wsport });

function start() {
	logger.info(`WebSocket-Server listening on port ${wsport}`);
	wss.on("connection", (ws) => {
		ws.on("message", async (message) => {
			logger.info(`Received message: ${message}`);
			try {
				const parsedMessage = JSON.parse(message);
				await storeMessage(parsedMessage);
				ws.send(`Echo: ${message}`);
			} catch (error) {
				logger.info(error);
			}
		});
		ws.send("Welcome to the WebSocket server!");
	});
}

module.exports = start;
