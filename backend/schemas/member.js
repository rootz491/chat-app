const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
	{
		userRef: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		communityRef: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Community",
			required: true,
		},
		badges: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Badge",
			},
		],
		role: {
			type: String,
			required: true,
			enum: ["member", "moderator", "owner"],
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("Member", memberSchema);
