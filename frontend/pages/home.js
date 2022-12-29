import axios from "axios";
import { io } from "socket.io-client";
import React, { useContext, useEffect, useState } from "react";
import {
	Box,
	Button,
	Flex,
	Grid,
	Heading,
	Image,
	Input,
	Text,
	useWebSocket,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { UserContext } from "../context/user";
import ChatBox from "../components/chatbox";

const Home = () => {
	const value = useContext(UserContext);
	const router = useRouter();
	const [username, setUsername] = useState("");
	const [token, setToken] = useState("");
	const [socket, setSocket] = useState(null);

	useEffect(() => {
		setUsername(value[0]?.name);
		setToken(localStorage.getItem("auth-token"));
		if (token == null) router.push("/login");
		const s = io("ws://localhost:8080");
		s.emit("join", { username });
		setSocket(s);
	}, []);

	// Send message to server
	const sendMessage = (message) => {
		console.log("sending " + message);
		if (socket == null) {
			return;
		}
		socket.emit("message", {
			type: "message",
			text: message,
		});
	};

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
					src={`https://avatars.dicebear.com/api/pixel-art/${
						username ?? "anonymous"
					}.svg`}
				/>
				<Text>{username ?? "Anonymous"}</Text>
			</Flex>
			<ChatBox initialMessages={[]} sendMessage={sendMessage} socket={socket} />
		</>
	);
};

export default Home;
