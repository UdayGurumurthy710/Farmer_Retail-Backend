import sharp from "sharp";
import cloudinary from "../config/cloudinary.js";

export const optimizeImage = async (path) => {
  return sharp(path)
    .resize(800, 800, { fit: "inside" })
    .jpeg({ quality: 70 })
    .toBuffer();
};

// upload stays same (buffer expected here)
export const uploadToCloudinary = (buffer, folder = "products") =>
  new Promise((resolve, reject) => {
    cloudinary.v2.uploader
      .upload_stream({ folder }, (err, res) =>
        err ? reject(err) : resolve(res),
      )
      .end(buffer);
  });

// delete stays same
export const deleteImages = async (images = []) => {
  await Promise.all(
    images.map((img) => cloudinary.v2.uploader.destroy(img.publicId)),
  );
};
