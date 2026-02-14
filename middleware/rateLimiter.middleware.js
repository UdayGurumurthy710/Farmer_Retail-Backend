import rateLimit from "express-rate-limit";
import { logger } from "../utils/Logger.js";

/**
 * General API rate limiter
 * Prevents API flooding and DDoS attacks
 */
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again after 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn("Rate limit exceeded - General API", {
            ip: req.ip,
            path: req.path,
            userId: req.user?.id,
        });
        res.status(429).json({
            error: "Too many requests from this IP, please try again after 15 minutes",
        });
    },
});

/**
 * Upload endpoint rate limiter
 * Stricter limits for resource-intensive upload operations
 */
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 30, // Limit each IP to 30 uploads per hour
    message: "Too many upload requests, please try again after an hour",
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    handler: (req, res) => {
        logger.warn("Rate limit exceeded - Upload endpoint", {
            ip: req.ip,
            path: req.path,
            userId: req.user?.id,
        });
        res.status(429).json({
            error: "Too many upload requests, please try again after an hour",
        });
    },
});

/**
 * Authentication endpoint rate limiter
 * Prevents brute force attacks on login
 */
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 login attempts per 15 minutes
    message: "Too many login attempts, please try again after 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
    handler: (req, res) => {
        logger.warn("Rate limit exceeded - Authentication", {
            ip: req.ip,
            path: req.path,
            body: { email: req.body?.email }, // Log email but not password
        });
        res.status(429).json({
            error: "Too many login attempts, please try again after 15 minutes",
        });
    },
});
