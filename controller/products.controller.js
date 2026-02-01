import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../service/products.service.js";

export const getAllProductsController = async (req, res, next) => {
  try {
    const products = await getAllProducts(req.user.id);
    console.log(req);
    res.status(200).json({ products: products });
  } catch (error) {
    next(error);
  }
};

export const getProductByIdController = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(req.user.id, "userid");
    const product = await getProductById(id, req.user.id);
    res.status(200).json({ product: product });
  } catch (error) {
    next(error);
  }
};

export const createProductController = async (req, res, next) => {
  try {
    const { createdId } = req.query;
    const productData = req.body;
    const newProduct = await createProduct(productData, createdId);
    res.status(201).json({
      data: { msg: "Product created successfully" },
      product: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProductController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productData = req.body;
    const newProduct = await updateProduct(req.user.id, id, productData);
    res.status(201).json({
      data: { msg: "Product Updated successfully" },
      product: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProductController = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedProduct = await deleteProduct(req.user.id, id);
    res.status(200).json({
      data: { msg: "Product Deleted successfully" },
    });
  } catch (error) {
    next(error);
  }
};
