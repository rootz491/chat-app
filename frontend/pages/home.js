import axios from "axios";
import React, { useEffect } from "react";
import { Grid, Text } from "@chakra-ui/react";

function Home() {
	useEffect(() => {}, []);

	return (
		<Grid p="4" h="100vh" w="full" placeContent="center">
			<Text textAlign="center">Home Page.</Text>
		</Grid>
	);
}

export default Home;
