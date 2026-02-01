import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      enum: ["farmer", "customer", "admin"],
      required: true,
    },
    password: { type: String, required: true, select: false },
    isActive: { type: Boolean, default: false },
    refreshToken: { type: String, default: null },
  },
  { timestamps: true },
);

const User = mongoose.model("User", UserSchema);
export default User;
