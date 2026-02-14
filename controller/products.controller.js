import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../service/products.service.js";

import {
  optimizeImage,
  uploadToCloudinary,
  deleteImages,
} from "../service/image.service.js";
import fs from "fs/promises";
import Product from "../model/model.products.js";
import { logger } from "../utils/Logger.js";

export const getAllProductsController = async (req, res, next) => {
  try {
    logger.info("Fetching all products", { userId: req.user.id });
    const products = await getAllProducts(req.user.id);
    logger.info("Products fetched successfully", {
      userId: req.user.id,
      count: products.length,
    });
    res.status(200).json({ products: products });
  } catch (error) {
    logger.error("Failed to fetch products", {
      userId: req.user.id,
      error: error.message,
    });
    next(error);
  }
};

export const getProductByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info("Fetching product by ID", { userId: req.user.id, productId: id });
    const product = await getProductById(id, req.user.id);
    logger.info("Product fetched successfully", {
      userId: req.user.id,
      productId: id,
    });
    res.status(200).json({ product: product });
  } catch (error) {
    logger.error("Failed to fetch product", {
      userId: req.user.id,
      productId: req.params.id,
      error: error.message,
    });
    next(error);
  }
};

export const createProductController = async (req, res, next) => {
  try {
    const { createdId } = req.query;
    const productData = req.body;

    logger.info("Product creation started", {
      userId: createdId,
      productName: productData.name,
    });

    console.time("TOTAL_API_TIME");

    const newProduct = await createProduct(productData, createdId);

    const paths = req.files?.map((f) => f.path) || [];

    if (paths.length) {
      logger.info("Processing images for new product", {
        userId: createdId,
        productId: newProduct._id,
        fileCount: paths.length,
      });

      const images = [];

      for (const path of paths) {
        try {
          logger.debug("Optimizing and uploading image", {
            userId: createdId,
            path,
          });

          const optimized = await optimizeImage(path);
          const result = await uploadToCloudinary(optimized);

          images.push({
            url: result.secure_url,
            publicId: result.public_id,
          });

          logger.debug("Image uploaded to Cloudinary", {
            userId: createdId,
            url: result.secure_url,
          });

          // Delete local file after upload
          await fs.unlink(path).catch(() => { });
        } catch (err) {
          logger.error("Image upload failed", {
            userId: createdId,
            path,
            error: err.message,
          });
        }
      }

      if (images.length === 0) {
        logger.warn("No images were uploaded successfully", {
          userId: createdId,
          productId: newProduct._id,
        });
      }

      // Update product with images
      await Product.updateOne(
        { _id: newProduct._id },
        {
          $set: {
            status: "ready",
            images,
          },
        },
      );

      // Refresh product data with images
      newProduct.images = images;
      newProduct.status = "ready";

      logger.info("Images uploaded successfully", {
        userId: createdId,
        productId: newProduct._id,
        imageCount: images.length,
      });
    } else {
      logger.info("No images to process for product", {
        userId: createdId,
        productId: newProduct._id,
      });
      // No images, just mark as ready
      await Product.updateOne(
        { _id: newProduct._id },
        { $set: { status: "ready" } },
      );
      newProduct.status = "ready";
    }

    console.timeEnd("TOTAL_API_TIME");

    logger.info("Product created successfully", {
      userId: createdId,
      productId: newProduct._id,
      productName: newProduct.name,
    });

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    logger.error("Product creation failed", {
      userId: req.query.createdId,
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

export const updateProductController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productData = req.body;

    logger.info("Product update started", {
      userId: req.user.id,
      productId: id,
    });

    console.time("UPDATE_API_TIME");

    // Update product data first
    const updatedProduct = await updateProduct(req.user.id, id, productData);

    const paths = req.files?.map((f) => f.path) || [];

    if (paths.length) {
      logger.info("Processing new images for product update", {
        userId: req.user.id,
        productId: id,
        fileCount: paths.length,
      });

      const images = [];

      for (const path of paths) {
        try {
          logger.debug("Optimizing and uploading image", {
            userId: req.user.id,
            path,
          });

          const optimized = await optimizeImage(path);
          const result = await uploadToCloudinary(optimized);

          images.push({
            url: result.secure_url,
            publicId: result.public_id,
          });

          logger.debug("Image uploaded to Cloudinary", {
            userId: req.user.id,
            url: result.secure_url,
          });

          // Delete local file after upload
          await fs.unlink(path).catch(() => { });
        } catch (err) {
          logger.error("Image upload failed during update", {
            userId: req.user.id,
            productId: id,
            path,
            error: err.message,
          });
        }
      }

      if (images.length > 0) {
        // Delete old images from Cloudinary if they exist
        if (updatedProduct.images && updatedProduct.images.length > 0) {
          logger.info("Deleting old images from Cloudinary", {
            userId: req.user.id,
            productId: id,
            oldImageCount: updatedProduct.images.length,
          });
          await deleteImages(updatedProduct.images).catch((err) => {
            logger.error("Failed to delete old images", {
              userId: req.user.id,
              productId: id,
              error: err.message,
            });
          });
        }

        // Update product with new images
        await Product.updateOne(
          { _id: updatedProduct._id },
          {
            $set: {
              images,
            },
          },
        );

        // Refresh product data with new images
        updatedProduct.images = images;

        logger.info("Images updated successfully", {
          userId: req.user.id,
          productId: id,
          newImageCount: images.length,
        });
      } else {
        logger.warn("No images were uploaded successfully", {
          userId: req.user.id,
          productId: id,
        });
      }
    }

    console.timeEnd("UPDATE_API_TIME");

    logger.info("Product updated successfully", {
      userId: req.user.id,
      productId: id,
    });

    res.status(200).json({
      data: { msg: "Product Updated successfully" },
      product: updatedProduct,
    });
  } catch (error) {
    logger.error("Product update failed", {
      userId: req.user?.id,
      productId: req.params.id,
      error: error.message,
      stack: error.stack,
    });
    next(error);
  }
};

export const deleteProductController = async (req, res, next) => {
  try {
    const { id } = req.params;
    logger.info("Product deletion started", {
      userId: req.user.id,
      productId: id,
    });
    const deletedProduct = await deleteProduct(req.user.id, id);
    logger.info("Product deleted successfully", {
      userId: req.user.id,
      productId: id,
    });
    res.status(200).json({
      data: { msg: "Product Deleted successfully" },
    });
  } catch (error) {
    logger.error("Product deletion failed", {
      userId: req.user?.id,
      productId: req.params.id,
      error: error.message,
    });
    next(error);
  }
};
