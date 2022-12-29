import { Box, Button, Flex, Grid, Text } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";

export default function Wallet() {
	const [wallets, setWallets] = useState([]);
	const [address, setAddress] = useState("");
	const [phantom, setPhantom] = useState(null);
	const [connected, setConnected] = useState(false);

	useEffect(() => {
		console.log("phantom", phantom);

		//	Solana Phantom listener
		if (window["solana"]?.isPhantom) setPhantom(window["solana"]);

		const token = localStorage.getItem("authToken");
		if (token) fetchWallets(token);
		else throw new Error("No token found");

		phantom?.on("connect", () => {
			setConnected(true);
		});

		phantom?.on("disconnect", () => {
			setConnected(false);
		});
	}, [phantom]);

	const connectToPhantom = async () => {
		if (phantom) {
			const token = localStorage.getItem("authToken");
			const accounts = await phantom.connect();
			const address = accounts?.publicKey.toBase58();
			console.log("phantom address", address);
			setAddress(address);
			setConnected(true);

			//	check if wallet exists
			const wallet = wallets.find((w) => w.address === address);
			if (wallet) {
				alert("Wallet already exists");
				return;
			}

			//	create wallet
			postWallet(token, address);
		} else {
			alert("Please install phantom");
		}
	};

	const fetchWallets = async (token) => {
		// TODO implement this API endpoint
		// fetch("/api/wallets", {
		// 	method: "GET",
		// 	headers: {
		// 		"Content-Type": "application/json",
		// 		authorization: `Bearer ${token}`,
		// 	},
		// })
		// 	.then((res) => res.json())
		// 	.then((data) => {
		// 		setWallets(data);
		// 	});
	};

	const postWallet = async (token, address) => {
		// TODO implement this API endpoint
		// fetch("/api/wallets", {
		// 	method: "POST",
		// 	headers: {
		// 		"Content-Type": "application/json",
		//       authorization: `Bearer ${token}`,
		// 	},
		// 	body: JSON.stringify({
		// 		address,
		// 	}),
		// })
		// 	.then((res) => res.json())
		// 	.then((data) => {
		// 		fetchWallets(token);
		// 	});
	};

	const disconnectFromPhantom = async () => {
		if (phantom) {
			const dis = await phantom.disconnect();
			setConnected(false);
			console.log({ dis });
		}
	};

	return (
		<Box>
			{phantom != null ? (
				connected ? (
					<Grid gap={2} w="50%" m="auto">
						<Text textAlign="center">Connected to {address}</Text>
						<Button onClick={disconnectFromPhantom} w="full" mb="4">
							Disconnect from Phantom
						</Button>
					</Grid>
				) : (
					<Flex w="50%" m="auto">
						<Button
							w="min-content"
							m="auto"
							onClick={connectToPhantom}
							w="full"
							mb="4"
						>
							Connect to Phantom
						</Button>
					</Flex>
				)
			) : (
				<Text textAlign="center">
					Extension Unavailable. Please use Phantom Wallet!
				</Text>
			)}
		</Box>
	);
}
