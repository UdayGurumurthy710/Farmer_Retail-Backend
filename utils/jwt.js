import jwt from "jsonwebtoken";

export const CreateJwtToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      TokenType: "ACCESS",
    },
    process.env.JWTACCESS,
    {
      expiresIn: "3h",
    },
  );
};

export const CreateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      TokenType: "REFRESH",
    },
    process.env.JWTREFRESH,
    {
      expiresIn: "7d",
    },
  );
};
