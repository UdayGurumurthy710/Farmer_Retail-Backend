import User from "../model/model.user.js";
import CustomError from "../utils/CustomErrorHandler.js";
import { comparePassword, hashPassword } from "../utils/hash.js";
import { CreateJwtToken, CreateRefreshToken } from "../utils/jwt.js";

export const register = async (email, role, password) => {
  const UserExists = await User.findOne({ email });
  if (UserExists) {
    throw new CustomError("User Already Exists", 409);
  }

  const hashed = await hashPassword(password);
  return await User.create({ email, role: role, password: hashed });
};

export const login = async (email, password) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new CustomError("Account Not Founded! Please Register", 404);
  }
  const match = await comparePassword(password, user.password);

  if (!match) {
    throw new CustomError("Invalid Password! Check Password!", 401);
  }
  const accessToken = CreateJwtToken(user);
  const refreshToken = CreateRefreshToken(user);
  user.isActive = true;
  user.refreshToken = refreshToken;
  await user.save();
  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    },
  };
};

export const getAllUser = async () => {
  const users = await User.find({});
  return users;
};

export const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};
