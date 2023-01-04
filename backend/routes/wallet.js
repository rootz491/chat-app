const express = require("express");
const { getWallets, getWallet, createWallet } = require("../controllers/wallet");
const router = express.Router();

router.get("/", getWallets);
router.get("/:id", getWallet);
router.post("/", createWallet);

module.exports = router;