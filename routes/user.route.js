import express from "express";
import {
  login,
  register,
  logout,
  getAllUsers,
} from "../controller/auth.controller.js";
import { AuthMiddleware } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/auth.authorizeRoles.js";
import { errorHandler } from "../middleware/errrorHandler.middleware.js";
const router = express.Router();

router.post("/login", login);
router.post("/register", register, errorHandler);

//protected Routes

router.get("/auth/users", AuthMiddleware, authorizeRoles("admin"), getAllUsers);

router.post("/auth/logout", AuthMiddleware, logout);
// router.post("auth/products");
// router.post("auth/products/:id");
// router.post("auth/products/:id");
export default router;
