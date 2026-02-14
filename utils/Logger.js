import winston from "winston";

// Custom log levels with security level
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    security: 2,
    info: 3,
    http: 4,
    debug: 5,
  },
  colors: {
    error: "red",
    warn: "yellow",
    security: "magenta",
    info: "green",
    http: "cyan",
    debug: "blue",
  },
};

// Add colors to Winston
winston.addColors(customLevels.colors);

// Custom format for better readability
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

// Console format with colors for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(
    (info) =>
      `${info.timestamp} [${info.level}]: ${info.message} ${info.userId ? `| User: ${info.userId}` : ""} ${info.ip ? `| IP: ${info.ip}` : ""}`,
  ),
);

export const logger = winston.createLogger({
  levels: customLevels.levels,
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: customFormat,
  transports: [
    // Console transport with colors
    new winston.transports.Console({
      format: consoleFormat,
    }),
    // Error log file
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Security log file
    new winston.transports.File({
      filename: "logs/security.log",
      level: "security",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined log file
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  // Handle uncaught exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({ filename: "logs/exceptions.log" }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: "logs/rejections.log" }),
  ],
});

// Helper function to log with context
export const logWithContext = (level, message, context = {}) => {
  logger.log(level, message, context);
};
