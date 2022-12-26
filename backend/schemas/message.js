const mongoose = require('mongoose');
const validator = require("mongoose-validator");

const messageSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            default: '',
        },
        gif: {
            type: String,
            required: false,
            validate: validator({
                validator: "isURL",
                message: "Invalid gif URL",
                protocols: ["http", "https"],
                require_protocol: true
            }),
        },
        image: {
            type: String,
            required: false,
            validate: validator({
                validator: "isURL",
                message: "Invalid image URL",
                protocols: ["http", "https"],
                require_protocol: true
            }),
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'member',
        },
        community: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'community',
        },
        repliedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'message',
        },
    },
    {
        timestamps: true
    }
);


module.exports = mongoose.model('Message', messageSchema);