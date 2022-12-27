const mongoose = require('mongoose');
const validator = require('mongoose-validator');

const nftSchema = new mongoose.Schema({
  blockchain: {
    type: String,
    required: true,
    index: true,
    enum: ['Ethereum', 'Solana']
  },
  collectionOwner: {
    type: String,
    required: true,
    index: true
  },
  image: {
    type: String,
    validate: validator({
      validator: 'isURL',
      message: 'Invalid image URL',
      protocols: ['http', 'https'],
      require_protocol: true
    })
  },
  name: {
    type: String,
    required: true
  },
  tokenId: {
    type: String,
    required: true,
    unique: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('NFT', nftSchema);