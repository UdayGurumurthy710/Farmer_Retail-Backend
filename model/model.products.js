import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  status: {
    type: String,
    enum: ["processing", "ready", "failed"],
    default: "processing",
  },
  images: [
    {
      url: String,
      publicId: String,
    },
  ],
  price: { type: Number, required: true },
  description: { type: String, required: true, trim: true, lowercase: true },
  category: { type: String, required: true, trim: true, lowercase: true },
  inStock: { type: Boolean, default: true },
  StockQuantity: { type: Number, default: 0 },
  createdId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

export default mongoose.model("Product", ProductSchema);
