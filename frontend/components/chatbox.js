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

function ChatBox({ chat = [], sendMessage }) {
	const [messages] = useState(chat);
	const [message, setMessage] = useState("");

	const submitHandler = (e) => {
		if (message === "") return;
		sendMessage(message);
		setMessage("");
	};

	useEffect(() => {}, [messages]);

	return (
		<Box m={4} p={2} rounded={4} border="1px solid gray">
			<Heading textAlign="center">Chat Box</Heading>
			<Flex
				flexDirection="column"
				w="full"
				h="50vh"
				alignItems="start"
				justifyContent="start"
				gap={4}
				overflowY="scroll"
			>
				{messages.length > 0 ? (
					messages.map((message, index) => (
						<Flex
							key={index}
							w="full"
							height={10}
							gap={4}
							justify="space-around"
							alignItems="baseline"
						>
							<Text color="teal.300">{message.username}</Text>
							<Text w="85%" ml="auto">
								{message.text}
							</Text>
						</Flex>
					))
				) : (
					<Text textAlign="center" w="full" p="5">
						No messages yet
					</Text>
				)}
			</Flex>
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
