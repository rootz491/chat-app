const Message = require("../schemas/message");
const logger = require("../utils/logger");


const messageFieldMap = {
	text: "content",
	gif: "gif",
	image: "image",
  };
  

  const storeMessage = async (message) => {
	try {
	  const newMessage = new Message({
		[messageFieldMap[message.type]]: message.text,		//	sus
		timestamp: new Date(),
		author: message.author,
		community: message.community,
		repliedTo: message.repliedTo,
	  });
	  await newMessage.save();
	} catch (error) {
	  logger.info(error.toString());
	}
  };

module.exports = storeMessage;
