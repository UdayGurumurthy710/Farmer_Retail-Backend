import bcrypt from "bcrypt";

export const hashPassword = async (pwd) => {
  return await bcrypt.hash(pwd, 12);
};

export const comparePassword = async (pwd, hashpwd) => {
  return await bcrypt.compare(pwd, hashpwd);
};
