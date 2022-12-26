const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const Sentry = require('@sentry/node');
const websocket = require('./websocket');
const winston = require("winston");
const helmet = require("helmet");

// Load Config & Sentry
Sentry.init({ dsn: 'https://ea69acd8829843d1bae67b685a5e044a@o4504392106770432.ingest.sentry.io/4504392107753472' });
require("dotenv").config();

// Initialize Logger
const logger = winston.createLogger({
	level: "info",
	format: winston.format.json(),
	transports: [new winston.transports.Console()]
  });

// Connect to MongoDB
const connectToMongo = async () => {
	await mongoose.connect(process.env.MONGO_URI, {
	  useNewUrlParser: true,
	  useUnifiedTopology: true,
	});
	logger.info("Connected to MongoDB");
  };
  
  connectToMongo();

// WS Server
websocket.start();

// Routes
const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const authRouter = require("./routes/auth");
const { isAuthenticated } = require("./middleware");

// Express App & Sub-Apps
const app = express();
app.use(helmet());

// Middleware
app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use Sentry Debugging
app.use(Sentry.Handlers.requestHandler());

// Routes
app.use("/", indexRouter);
app.use("/v1/auth", authRouter);
app.use("/v1/user", isAuthenticated, usersRouter);

// Use Sentry Error Handler
app.use(Sentry.Handlers.errorHandler());

// Express Server
app.listen(8000, async () => {
	logger.info("Server started on port 8000");
});


//TODO:
// password hash
// password reset


// gobj= {
	//id : string
	//name : string
	//email : string
	//picture : string

// }