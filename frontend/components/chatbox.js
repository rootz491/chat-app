import {
	Box,
	Button,
	Flex,
	Grid,
	Heading,
	Input,
	Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

function ChatBox({ initialMessages = [], sendMessage, socket }) {
	const [messages, setMessages] = useState(initialMessages);
	const [message, setMessage] = useState("");

	// Receive message from server
	useEffect(() => {
		// TODO use this when websocket is implemented
		if (socket == null) {
			return;
		}
		socket.on("message", (message) => {
			console.log("Message received ", message);
			messages.push({
				id: messages.length + 1,
				message: message?.text ?? message,
				username: "test",
			});
			// setMessages([
			// 	...messages,
			// 	{
			// 		id: messages.length + 1,
			// 		message: message?.text ?? message,
			// 		username: "test",
			// 	},
			// ]);
		});

		return () => {
			socket.off("message");
		};
	}, [socket]);

	const submitHandler = (e) => {
		if (message === "") return;
		sendMessage(message);
		setMessage("");
	};

	return (
		<Box m={4} p={2} rounded={4} border="1px solid gray">
			<Heading textAlign="center">Chat Box</Heading>
			<Grid
				w="full"
				h="50vh"
				placeContent={messages.length > 0 ? "start" : "center"}
				gap={4}
				overflowY="scroll"
			>
				{messages.length > 0 ? (
					messages.map((message, index) => (
						<Flex
							key={index}
							w="full"
							gap={4}
							justify="space-around"
							alignItems="baseline"
						>
							<Text>{message.username}</Text>
							<Text>{message.message}</Text>
						</Flex>
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
				<Button colorScheme="teal" type="submit" onClick={submitHandler}>
					Send
				</Button>
			</Flex>
		</Box>
	);
}

export default ChatBox;
