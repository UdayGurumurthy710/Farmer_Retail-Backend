import CustomError from "../utils/CustomErrorHandler.js";
import { logger } from "../utils/Logger.js";

// Magic numbers (file signatures) for image validation
const MAGIC_NUMBERS = {
    JPEG: [0xff, 0xd8, 0xff],
    PNG: [0x89, 0x50, 0x4e, 0x47],
    WEBP: [0x52, 0x49, 0x46, 0x46], // RIFF
};

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
];

// Allowed extensions
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

// File size limits
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
const MAX_TOTAL_SIZE = 25 * 1024 * 1024; // 25MB total

/**
 * Validate file using magic numbers (file signatures)
 * Prevents malicious files disguised with fake extensions
 */
const validateMagicNumber = (buffer) => {
    const fileSignature = Array.from(buffer.slice(0, 4));

    // Check JPEG
    if (
        fileSignature[0] === MAGIC_NUMBERS.JPEG[0] &&
        fileSignature[1] === MAGIC_NUMBERS.JPEG[1] &&
        fileSignature[2] === MAGIC_NUMBERS.JPEG[2]
    ) {
        return true;
    }

    // Check PNG
    if (
        fileSignature[0] === MAGIC_NUMBERS.PNG[0] &&
        fileSignature[1] === MAGIC_NUMBERS.PNG[1] &&
        fileSignature[2] === MAGIC_NUMBERS.PNG[2] &&
        fileSignature[3] === MAGIC_NUMBERS.PNG[3]
    ) {
        return true;
    }

    // Check WebP (RIFF)
    if (
        fileSignature[0] === MAGIC_NUMBERS.WEBP[0] &&
        fileSignature[1] === MAGIC_NUMBERS.WEBP[1] &&
        fileSignature[2] === MAGIC_NUMBERS.WEBP[2] &&
        fileSignature[3] === MAGIC_NUMBERS.WEBP[3]
    ) {
        return true;
    }

    return false;
};

/**
 * File validation middleware
 * Validates file type, size, and magic numbers
 */
export const validateImageUpload = async (req, res, next) => {
    try {
        // If no files, skip validation
        if (!req.files || req.files.length === 0) {
            return next();
        }

        const files = req.files;
        let totalSize = 0;

        logger.info("File validation started", {
            userId: req.user?.id,
            fileCount: files.length,
        });

        // Validate each file
        for (const file of files) {
            // 1. Check file size
            if (file.size > MAX_FILE_SIZE) {
                logger.warn("File size exceeds limit", {
                    userId: req.user?.id,
                    fileName: file.originalname,
                    fileSize: file.size,
                    maxSize: MAX_FILE_SIZE,
                });
                throw new CustomError(
                    `File ${file.originalname} exceeds maximum size of 5MB`,
                    400,
                );
            }

            totalSize += file.size;

            // 2. Check file extension
            const ext = file.originalname
                .toLowerCase()
                .substring(file.originalname.lastIndexOf("."));
            if (!ALLOWED_EXTENSIONS.includes(ext)) {
                logger.warn("Invalid file extension", {
                    userId: req.user?.id,
                    fileName: file.originalname,
                    extension: ext,
                });
                throw new CustomError(
                    `File type ${ext} not allowed. Only JPEG, PNG, and WebP images are accepted`,
                    400,
                );
            }

            // 3. Check MIME type
            if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
                logger.warn("Invalid MIME type", {
                    userId: req.user?.id,
                    fileName: file.originalname,
                    mimeType: file.mimetype,
                });
                throw new CustomError(
                    `Invalid file type. Only image files are allowed`,
                    400,
                );
            }

            // 4. Validate magic numbers (file signature)
            const fs = await import("fs/promises");
            const fileBuffer = await fs.readFile(file.path);

            if (!validateMagicNumber(fileBuffer)) {
                logger.warn("Invalid file signature (magic number)", {
                    userId: req.user?.id,
                    fileName: file.originalname,
                    mimeType: file.mimetype,
                });

                // Delete the suspicious file
                await fs.unlink(file.path).catch(() => { });

                throw new CustomError(
                    `File ${file.originalname} appears to be corrupted or is not a valid image`,
                    400,
                );
            }
        }

        // 5. Check total upload size
        if (totalSize > MAX_TOTAL_SIZE) {
            logger.warn("Total upload size exceeds limit", {
                userId: req.user?.id,
                totalSize,
                maxSize: MAX_TOTAL_SIZE,
            });
            throw new CustomError(
                `Total upload size exceeds maximum of 25MB`,
                400,
            );
        }

        logger.info("File validation passed", {
            userId: req.user?.id,
            fileCount: files.length,
            totalSize,
        });

        next();
    } catch (error) {
        // Clean up uploaded files on error
        if (req.files && req.files.length > 0) {
            const fs = await import("fs/promises");
            for (const file of req.files) {
                await fs.unlink(file.path).catch(() => { });
            }
        }
        next(error);
    }
};
