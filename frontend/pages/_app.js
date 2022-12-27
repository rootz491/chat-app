import { ChakraProvider } from '@chakra-ui/react';
import { extendTheme } from '@chakra-ui/react';
import { CSSReset } from '@chakra-ui/react';
import { UserProvider } from '../context/user';
import '../styles/globals.css';

// theme if required
const theme = extendTheme({});
function MyApp({ Component, pageProps }) {
  return (
		<UserProvider>
			<ChakraProvider theme={theme}>
				<CSSReset />
				{/* usercontextProvider */}
				<Component {...pageProps} />
			</ChakraProvider>
		</UserProvider>
	);
}

export default MyApp;
