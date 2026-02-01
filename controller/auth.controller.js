import * as authService from "./auth.service.js";
import { logger } from "../utils/Logger.js";

export const register = async (req, res, next) => {
  const user = await authService.register(
    req.body.email,
    req.body.role,
    req.body.password,
  );

  logger.info("User Registered ", {
    userId: user._id,
  });
  res.status(200).json({
    message: "User Registered",
    id: user._id,
  });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken, user } = await authService.login(
    email,
    password,
  );
  res.cookie("refreshtoken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
  });
  logger.info("Login Successfull", {
    userId: user._id,
    email: user.email,
    role: user.role,
  });
  return res.status(200).json({ accessToken, refreshToken, user });
};

export const getAllUsers = async (req, res, next) => {
  const users = await authService.getAllUser();
  return res.status(200).json({ users: users });
};

export const logout = async (req, res, next) => {
  console.log(req.user);
  await authService.logout(req.user.id);
  res.clearCookie("refreshToken");
  logger.info("logout successfull", {
    userId: req.user.id,
  });
  return res.status(200).json({ message: "Logout Successful" });
};
