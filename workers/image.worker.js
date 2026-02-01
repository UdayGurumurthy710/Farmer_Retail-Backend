import fs from "fs/promises";
import Product from "../model/model.products.js";
import {
  optimizeImage,
  uploadToCloudinary,
  deleteImages,
} from "../service/image.service.js";

export const processImageJob = async (job) => {
  console.log("Worker started:", job.id);

  console.time(`JOB_${job.id}`);

  const { productId, paths } = job.data;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      console.log("Product not found");
      return;
    }

    // delete old images in cloudinary
    await deleteImages(product.images || []);

    const images = [];

    for (const path of paths) {
      try {
        console.log("Processing:", path);

        const optimized = await optimizeImage(path);

        const result = await uploadToCloudinary(optimized);

        images.push({
          url: result.secure_url,
          publicId: result.public_id,
        });

        // delete local file safely
        await fs.unlink(path).catch(() => {});
      } catch (err) {
        console.log("Image failed:", path, err.message);
      }
    }

    await Product.updateOne(
      { _id: productId },
      {
        $set: {
          status: "ready",
          images,
        },
      },
    );

    console.log("DB updated for product:", productId);
  } catch (err) {
    console.log("Worker crashed:", err.message);
    throw err; // allow Bull retry
  }

  console.timeEnd(`JOB_${job.id}`);
  console.log("🏁 Worker finished:", job.id);
};
