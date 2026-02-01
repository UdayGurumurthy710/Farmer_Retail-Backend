import jwt from "jsonwebtoken";
import { logger } from "../utils/Logger.js";

export const AuthMiddleware = (req, res, next) => {
  const authHeaders = req.headers.authorization;
  if (!authHeaders) {
    logger.warn("Missing Authorization Headers ", {
      ip: req.ip,
      path: req.originalUrl,
    });
    return res.status(401).json({
      message: "Unauthorized! Please Login!",
    });
  }

  const token = authHeaders.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWTACCESS);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    logger.warn("Invalid or expired JWT", {
      ip: req.ip,
      path: req.originalUrl,
    });
    return res.status(401).json({ message: "Invalid Token. Try again..." });
  }
};
