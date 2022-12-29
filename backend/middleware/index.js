const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

exports.isAuthenticated = (req, res, next) => {
	try {
		if (req.headers.authorization) {
			if (req.headers.authorization.split(" ")[0] !== "Bearer")
				throw { message: "Incorrect token prefix", status: 400 };
			// Check that the JWT token is not empty or undefined
			const jwtToken = req.headers.authorization.split(" ")[1];
			if (!jwtToken || jwtToken === "") {
				throw { message: "JWT token is empty or undefined" };
			}
			jwt.verify(jwtToken, process.env.JWT_SECRET, (err, decoded) => {
				if (err) {
					throw {
						message: "Invalid token",
						status: 401,
					};
				}
				const { id, github_access_token } = decoded;
				req.user = {
					id,
					github_access_token,
				};
				next();
			});
		} else {
			throw {
				message: "No token provided",
				status: 401,
			};
		}
	} catch (error) {
		if (error.message === "Incorrect token prefix") {
			res.status(400).json({
				message: "Incorrect token prefix",
			});
		} else if (error.message === "JWT token is empty or undefined") {
			res.status(400).json({
				message: "JWT token is empty or undefined",
			});
		} else if (error.message === "Invalid token") {
			res.status(401).json({
				message: "Invalid token",
			});
		} else if (error.message === "No token provided") {
			res.status(401).json({
				message: "No token provided",
			});
		} else {
			res.status(500).json({
				message: "Something went wrong",
			});
		}
	}
};

exports.isSocketAuthenticated = (socket, next) => {
	try {
		// verify the JWT in the query string
		const { token } = socket.handshake.query;
		// console.log({ token });
		if (!token) {
			logger.info("No token provided");
			return socket.disconnect(true); // disconnect the socket if no token is provided
		}
		// decode and verify with jwt key
		const payload = jwt.verify(token, process.env.JWT_SECRET);
		// use payload for perms
		socket.userInfo = payload;
		next();
	} catch (error) {
		logger.error(error.toString());
		return socket.disconnect(true); // disconnect
	}
};
