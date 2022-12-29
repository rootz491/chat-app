const Message = require("../schemas/message");
const logger = require("../utils/logger");

const storeMessage = async (message) => {
	try {
		let newMessage;
		switch (message.type) {
			case "text":
				newMessage = new Message({
					content: message.text,
					timestamp: new Date(),
					author: message.author,
					community: message.community,
					repliedTo: message.repliedTo,
				});
				break;
			case "gif":
				newMessage = new Message({
					gif: message.text,
					timestamp: new Date(),
					author: message.author,
					community: message.community,
					repliedTo: message.repliedTo,
				});
				break;
			case "image":
				newMessage = new Message({
					image: message.text,
					timestamp: new Date(),
					author: message.author,
					community: message.community,
					repliedTo: message.repliedTo,
				});
				break;
			default:
				throw new Error("Invalid message type");
		}
		await newMessage.save();
	} catch (error) {
		logger.info(error);
	}
};

module.exports = storeMessage;
