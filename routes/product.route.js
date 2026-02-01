import { Router } from "express";
import {
  createProductController,
  deleteProductController,
  getAllProductsController,
  getProductByIdController,
  updateProductController,
} from "../controller/products.controller.js";
import { AuthMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/auth.authorizeRoles.js";
import { errorHandler } from "../middleware/errrorHandler.middleware.js";
import { upload } from "../config/multer.js";
// import upload from "../middleware/upload.middleware.js";

const productRoute = Router();

productRoute.get(
  "/",
  AuthMiddleware,

  getAllProductsController,
  errorHandler,
);
productRoute.post(
  "/",
  AuthMiddleware,
  authorizeRoles("farmer"),
  upload.array("images", 5),
  createProductController,
  errorHandler,
);
productRoute.get(
  "/:id",
  AuthMiddleware,
  getProductByIdController,
  errorHandler,
);
productRoute.patch(
  "/:id",
  AuthMiddleware,
  authorizeRoles("farmer"),
  updateProductController,
  errorHandler,
);
productRoute.delete(
  "/:id",
  AuthMiddleware,
  authorizeRoles("farmer"),
  deleteProductController,
  errorHandler,
);

export default productRoute;
