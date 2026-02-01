import sharp from "sharp";
import cloudinary from "../config/cloudinary.js";
import { imageQueue } from "../queue/imageQueue.js";

imageQueue.process(async (job) => {
  const { buffer, productId } = job.data;

  const optimized = await sharp(buffer)
    .resize(800, 800, { fit: "inside" })
    .jpeg({ quality: 70 })
    .toBuffer();

  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "products" }, (err, res) =>
        err ? reject(err) : resolve(res),
      )
      .end(optimized);
  });

  return {
    productId,
    imageUrl: result.secure_url,
    publicId: result.public_id,
  };
});
