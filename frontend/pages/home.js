import axios from "axios";
import React, { useEffect } from "react";
import { Grid, Text, useWebSocket } from "@chakra-ui/react";
import { useRouter } from 'next/router';

const Home = () => {
	const router = useRouter();
	const { data, loading, error } = useQuery(GET_CURRENT_USER);
	const [username, setUsername] = useState('');
	const [token, setToken] = useState('');

	// Get current user's username
	const fetchUser = () => {
		axios
			.get("/v1/user", {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			.then((res) => {
				console.log(res.data);
				setUser(res.data);
			})
			.catch((err) => console.log(err));
	};
	
	// Connect to WebSocket server
	const ws = useWebSocket('ws://localhost:8080', {
		headers: {
			'Authorization': `Bearer ${token}`,
		},
	});
  
	// Send message to server
	const sendMessage = (message) => {
	  ws.send(JSON.stringify({
		message
	  }));
	};

	const getInitialMessages = () => {

	}

	return (
	  <>
		<Navigation />
		<div style={{ display: 'flex', justifyContent: 'space-between' }}>
		  <CircularImage />
		  <p style={{ margin: 'auto 0' }}>{username}</p>
		</div>
		<ChatBox initialMessages={initialMessages} sendMessage={sendMessage} ws={ws} />
	  </>
	);
};

function ChatBox({ initialMessages = [], sendMessage, username }) {
	const [messages, setMessages] = useState(initialMessages);
	const [message, setMessage] = useState("");

	// Receive message from server
	useEffect(() => {
		ws.onmessage = (event) => {
			const { username, message } = JSON.parse(event.data);
	
			// Add message to chatbox
			setMessages((messages) => [...messages, { username, message }]);
		};
	}, [ws]);

	const submitHandler = (e) => {
		e.preventDefault();
		sendMessage(message);
	}

	return (
		<>
			{
				messages.map((message, index) => (
					<div key={index}>
						<p>{message.username}</p>
						<p>{message.message}</p>
					</div>
				))
			}
			<form onSubmit={submitHandler} >
				<Input type="text" value={message} onChange={e => setMessage(e.target.value)} />
				<button type="submit">Send</button>
			</form>
		</>
	)
}

export default Home;
