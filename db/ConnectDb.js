import mongoose from "mongoose";

export const ConnectDb = (url) => mongoose.connect(url);
