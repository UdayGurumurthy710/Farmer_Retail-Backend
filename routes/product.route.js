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
import { validateImageUpload } from "../middleware/fileValidation.middleware.js";
import { uploadLimiter } from "../middleware/rateLimiter.middleware.js";

const productRoute = Router();

productRoute.get(
  "/",
  AuthMiddleware,

  getAllProductsController,
  errorHandler,
);
productRoute.post(
  "/",
  uploadLimiter,
  AuthMiddleware,
  authorizeRoles("farmer"),
  upload.array("images", 5),
  validateImageUpload,
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
  uploadLimiter,
  AuthMiddleware,
  authorizeRoles("farmer"),
  upload.array("images", 5),
  validateImageUpload,
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
