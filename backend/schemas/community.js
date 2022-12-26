const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
      },
      id: {
        type: String,
        required: true,
        unique: true
      },
      users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      moderators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      owners: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      blacklist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
      settings: {
        type: Object,
        default: ['nothing']
      },
      messages: [{
        type: mongoose.Schema.Types.Mixed,
        ref: 'Message'
      }]
    });

const Community = mongoose.model('Community', communitySchema);

module.exports = Community;