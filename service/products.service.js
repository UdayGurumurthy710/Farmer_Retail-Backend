import mongoose from "mongoose";
import Product from "../model/model.products.js";
import User from "../model/model.user.js";
import CustomError from "../utils/CustomErrorHandler.js";

export const getAllProducts = async (id) => {
  if (id) {
    const products = await Product.find({ createdId: id });
    const user = await User.findById(id);

    if (user.role !== "farmer") {
      const products = await Product.find({});
      return products;
    }

    if (!products) {
      return new CustomError("No products found for this user", 404);
    }
    return products;
  }
};

export const getProductById = async (productId, id) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new CustomError("Product not found", 404);
  }

  if (id !== product.createdId.toString()) {
    throw new CustomError("Unauthorized access to product", 403);
  }
  return product;
};

export const createProduct = async (productData, id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new CustomError("Invalid user id", 400);
  }

  const user = await User.findById(id);

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  if (user.role !== "farmer") {
    throw new CustomError("Only farmers can create products", 403);
  }
  const existingProduct = await Product.findOne({
    name: productData.name,
    createdId: id,
  });

  if (existingProduct) {
    throw new CustomError("Product with the same name already exists", 409);
  }

  const newProduct = await Product.create({
    ...productData,
    createdId: id,
    status: "processing",
  });

  return newProduct;
};

export const updateProduct = async (userId, productId, updateData) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new CustomError("Invalid user id", 400);
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new CustomError("Invalid product id", 400);
  }

  const user = await User.findById(userId).select("role");
  if (!user) {
    throw new CustomError("User not found", 404);
  }

  if (user.role !== "farmer") {
    throw new CustomError("Only farmers can update products", 403);
  }

  delete updateData.createdId;
  delete updateData.createdAt;
  delete updateData.updatedAt;

  if (updateData.name) {
    const duplicate = await Product.findOne({
      name: updateData.name,
      createdId: userId,
      _id: { $ne: productId },
    });

    if (duplicate) {
      throw new CustomError("Product with same name already exists", 409);
    }
  }

  const product = await Product.findOne({
    _id: productId,
    createdId: userId,
  });

  if (!product) {
    throw new CustomError("Product not found or unauthorized", 404);
  }

  Object.assign(product, updateData);

  if (!product.isModified()) {
    throw new CustomError("No changes detected", 400);
  }

  await product.save();
  return product;
};

export const deleteProduct = async (userId, productId) => {
  const product = await Product.findByIdAndDelete(productId);
  if (!product) {
    throw new CustomError("Product not found", 404);
  }

  return true;
};
