import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import { ConnectDb } from "./db/ConnectDb.js";
import router from "./routes/user.route.js";
import productRoute from "./routes/product.route.js";
import morgan from "morgan";
import { generalLimiter } from "./middleware/rateLimiter.middleware.js";
import { logger } from "./utils/Logger.js";

dotenv.config();

//variables
const app = express();
const Port = process.env.PORT || 3000;

// Configure allowed origins for CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:5173"];

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  }),
);

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        logger.warn("CORS blocked request", { origin });
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

//middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Morgan HTTP logging with Winston
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  }),
);

// Apply general rate limiting to all routes
app.use(generalLimiter);

//routes
app.use("/api/v1/", router);
app.use("/api/v1/products", productRoute);

//starting the server
const start = async () => {
  try {
    ConnectDb(process.env.MONGODB);
    logger.info("Database connected successfully");
    app.listen(Port, () => {
      logger.info(`Server is listening on port ${Port}`);
      logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    logger.error("Failed to start server", { error: error.message });
    process.exit(1);
  }
};

start();
