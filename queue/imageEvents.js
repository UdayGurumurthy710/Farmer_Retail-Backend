import { imageQueue } from "./imageQueue.js";
import Product from "../model/model.products.js";
imageQueue.on("completed", async (job, result) => {
  const { productId, imageUrl, publicId } = result;

  const product = await Product.findById(productId);
  if (!product) return;

  product.images.push({
    url: imageUrl,
    publicId,
  });

  await product.save();
});
