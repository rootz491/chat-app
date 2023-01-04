const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			index: true,
		},
		blockchain: {
			type: String,
			required: true,
			index: true,
			enum: ["Ethereum", "Solana"],
		},
		address: {
			type: String,
			required: true,
		},
		network: {
			type: String,
			required: true,
			index: true,
			enum: ["Mainnet", "Testnet"],
		},
		owner: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("Wallet", walletSchema);
