import express from "express";
import { connect, ConnectOptions } from "mongoose";
import userRouter from "./user.route";
import * as dotenv from "dotenv";

dotenv.config();

const PORT = process.env.SERVER_PORT;

const app = express();

app.use(express.json());

app.use("/user", userRouter);

const url = process.env.DB_URL as string;
const connectionOptions: ConnectOptions = {};
connect(url, connectionOptions)
  .then(() => console.log("Connected to database"))
  .catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log(`Server is running at localhost:${PORT}`);
});
