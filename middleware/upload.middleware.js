import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(), // buffers
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export default upload;
