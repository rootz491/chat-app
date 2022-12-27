const mongoose = require('mongoose');

const storeMessage = async (message) => {
    let newMessage;
    switch (message.type) {
      case 'text':
        newMessage = new Message({
          content: message.text,
          username: message.username,
          timestamp: new Date(),
          author: message.author,
          community: message.community,
          repliedTo: message.repliedTo,
        });
        break;
      case 'gif':
        newMessage = new Message({
          gif: message.text,
          username: message.username,
          timestamp: new Date(),
          author: message.author,
          community: message.community,
          repliedTo: message.repliedTo,
        });
        break;
      case 'image':
        newMessage = new Message({
          image: message.text,
          username: message.username,
          timestamp: new Date(),
          author: message.author,
          community: message.community,
          repliedTo: message.repliedTo,
        });
        break;
      default:
        throw new Error('Invalid message type');
    }
    await newMessage.save();
  };

  module.exports = storeMessage;