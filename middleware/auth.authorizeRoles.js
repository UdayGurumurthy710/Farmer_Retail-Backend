import User from "../model/model.user.js";

export const authorizeRoles = (...roles) => {
  return async (req, res, next) => {
    const userData = await User.findById(req.user.id);
    if (!req.user || !roles.includes(userData.role)) {
      return res.status(403).json({
        message: `Role ${userData.role} is not Allowed!`,
      });
    }
    next();
  };
};
