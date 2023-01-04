const wallet = require("../../schemas/wallet");

exports.getWallets = async (req, res) => {
	try {
		const userId = req.user.id;
		const wallets = await wallet.find({ owner: userId });
		res.status(200).json({ wallets });
	} catch (error) {
		logger.error(error.toString());
		res.status(500).json({ error: error?.message ?? "Internal Server Error" });
	}
};

exports.getWallet = async (req, res) => {
	try {
		const userId = req.user.id;
		const { id } = req.params;
		const wallet = await wallet.findOne({ _id: id, owner: userId });
		if (!wallet) return res.status(404).json({ error: "Wallet not found" });
		res.status(200).json(wallet);
	} catch (error) {
		logger.error(error.toString());
		res.status(500).json({ error: error?.message ?? "Internal Server Error" });
	}
};

exports.createWallet = async (req, res) => {
	try {
		const userId = req.user.id;
		const { name, address, blockchain, network } = req.body;
		const newWallet = await wallet.create({
			name,
			address,
			blockchain,
			network,
			owner: userId,
		});
		res.status(200).json({ wallet: newWallet });
	} catch (error) {
		logger.error(error.toString());
		res.status(500).json({ error: error?.message ?? "Internal Server Error" });
	}
};
