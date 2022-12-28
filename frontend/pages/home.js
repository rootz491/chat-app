import axios from "axios";
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
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET;

const Home = () => {
	const value = useContext(UserContext);
	const router = useRouter();
	const [username, setUsername] = useState("");
	const [token, setToken] = useState("");

	useEffect(() => {
		setUsername(value[0]?.name);
		setToken(localStorage.getItem("auth-token"));
	}, []);

	// TODO initiate connection to websocket server
	// Connect to WebSocket server
	// const ws = useWebSocket("ws://localhost:8080", {
	// 	headers: {
	// 		Authorization: `Bearer ${token}`,
	// 	},
	// });

	// Send message to server
	const sendMessage = (message) => {
		ws.send(
		  JSON.stringify({
			message,
		  }),
		  { headers: { Authorization: `Bearer ${token}` } }
		);
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
			<ChatBox
				//initialMessages={getInitialMessages}
				sendMessage={sendMessage}
				// ws={ws}
			/>
		</>
	);
};

function ChatBox({ initialMessages = [], sendMessage, username }) {
	const [messages, setMessages] = useState(initialMessages);
	const [message, setMessage] = useState("");

	// Receive message from server
	useEffect(() => {
		// TODO use this when websocket is implemented
		// ws.onmessage = (event) => {
		// 	const { username, message } = JSON.parse(event.data);
		// 	// Add message to chatbox
		// 	setMessages((messages) => [...messages, { username, message }]);
		// };
	}, []);

	const submitHandler = (e) => {
		e.preventDefault();
		sendMessage(message, { headers: { Authorization: `Bearer ${token}` } });
	  };

	return (
		<Box m={4} p={2} rounded={4} border="1px solid gray">
			<Heading textAlign="center">Chat Box</Heading>
			<Grid minH="50vh" placeContent={messages.length > 0 ? "start" : "center"}>
				{messages.length > 0 ? (
					messages.map((message, index) => (
						<div key={index}>
							<p>{message.username}</p>
							<p>{message.message}</p>
						</div>
					))
				) : (
					<Text>No messages yet</Text>
				)}
			</Grid>
			<Flex mt={3}>
				<Input
					flex={1}
					type="text"
					value={message}
					onChange={(e) => setMessage(e.target.value)}
				/>
				<Button colorScheme="teal" type="submit">
					Send
				</Button>
			</Flex>
		</Box>
	);
}

export default Home;
