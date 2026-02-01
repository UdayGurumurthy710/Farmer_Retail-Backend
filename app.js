import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import { ConnectDb } from "./db/ConnectDb.js";
import router from "./routes/user.route.js";
import productRoute from "./routes/product.route.js";
dotenv.config();

//variables
const app = express();
const Port = process.env.PORT || 3000;

//middleware
app.use(express.json());

//routes
app.use("/api/v1/", router);
app.use("/api/v1/products", productRoute);
//starting the server

const start = async () => {
  try {
    ConnectDb(process.env.MONGODB);
    console.log("Db connected");
    app.listen(Port, console.log(`Server is Listening on Port -> ${Port}`));
  } catch (error) {}
};

start();
