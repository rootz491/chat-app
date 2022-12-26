const mongoose = require("mongoose");
const validator = require("mongoose-validator");

// Create User Schema
const userSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			minlength: 3,
			index: true,
			validate: validator({
				validator: "escape",
				message: "Invalid characters in username",
			}),
		},
		password: {
			type: String,
			trim: true,
			minlength: 3,
		},
		email: {
			type: String,
			required: true,
			unique: true,
			trim: true,
			minlength: 3,
			index: true,
			validate: validator({
				validator: "isEmail",
				message: "Invalid email format",
			}),
		},
		// Github Account ID
		githubId: {
			type: String,
			unique: true,
			sparse: true,
		},
		// Google Account ID
		googleId: {
			type: String,
			unique: true,
			sparse: true,
		},
		// User Profile Picture
		profilePicture: {
			type: String,
			validate: validator({
				validator: "isURL",
				message: "Invalid image URL",
				protocols: ["http", "https"],
				require_protocol: true,
			}),
		},
		// Array Field for IDs of User's Communities
		Communities: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Community",
				index: true,
			},
		],
		// User's global role
		role: {
			type: String,
			required: true,
			default: "user",
			enum: ["admin", "moderator", "user"],
		},
		// Token issued upon password reset
		passwordResetToken: {
			type: String,
			required: false,
		},
		// Expiry date of password reset token
		passwordResetExpires: {
			type: Date,
			required: false,
		},
		communities: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Community",
			},
		],
	},
	// Tells 'createdAt' and 'updatedAt' timestamps
	{
		timestamps: true,
	}
);

// Export User Model
module.exports = mongoose.model("User", userSchema);
