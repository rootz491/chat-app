const jwt = require("jsonwebtoken");

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
		jwt.verify(jwtToken, process.env.JWT_SECRET ?? "test", (err, decoded) => {
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
