const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			minlength: 3,
			maxlength: 16,
		},
		image: {
			type: String,
			required: true,
			trim: true,
			minlength: 3,
			validate: validator({
				validator: "escape",
				message: "Invalid characters in username",
			}),
			validate: validator({
				validator: "isURL",
				message: "Invalid image URL",
			}),
		},
		communityRef: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Community",
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("Badge", badgeSchema);
