const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			minlength: 3,
		},
		description: {
			type: String,
			required: true,
			trim: true,
			minlength: 3,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("Badge", badgeSchema);
