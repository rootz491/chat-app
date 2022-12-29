import { io } from "socket.io-client";
import React, { useContext, useEffect, useState } from "react";
import { Flex, Image, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { UserContext } from "../context/user";
import ChatBox from "../components/chatbox";
import Wallet from "../components/wallet";

const Home = () => {
	const value = useContext(UserContext);
	const router = useRouter();
	const [username, setUsername] = useState("");
	const [token, setToken] = useState("");
	const [messages, setMessages] = useState([]);
	const [socket, setSocket] = useState(null);

	useEffect(() => {
		if (value == null) return;
		const authToken = localStorage.getItem("auth-token");
		setUsername(value[0]?.username);
		setToken(authToken);
		if (token == null) router.push("/login");
		const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
			query: { token: authToken },
		});
		socket.emit("join", { username });
		socket.on("message", (message) => {
			console.log("Message received ", message);
			const newMessage = {
				text: message?.text ?? message,
				username: message?.username ?? "Anonymous",
			};
			messages.push(newMessage);
		});
		setSocket(socket);
		return () => {
			socket.disconnect();
			socket.off("message");
		};
	}, [value]);

	// Send message to server
	const sendMessage = (message) => {
		console.log("sending " + message);
		if (socket == null) {
			return;
		}
		socket.emit("message", {
			type: "text",
			text: message,
		});
	};

	// TODO
	// const getInitialMessages = () => {
	// Send a message to the server asking for the initial messages
	//	socket.emit("getInitialMessages", (response) => {
	// Set the initial messages on the client side
	//	  setInitialMessages(response.messages);
	//	});
	//  };

	return (
		<>
			{/* <Navigation /> */}
			<Flex justifyContent="space-between" alignItems="center" w="full" p="2">
				<Image
					w="50px"
					h="50px"
					rounded="full"
					src={`https://avatars.dicebear.com/api/pixel-art/${username}.svg`}
				/>
				<Text>{username}</Text>
			</Flex>
			<ChatBox chat={messages} sendMessage={sendMessage} />
			<Wallet />
		</>
	);
};

export default Home;
