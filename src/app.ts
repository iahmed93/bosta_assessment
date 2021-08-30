import express from "express";
import { connect, ConnectOptions } from "mongoose";
import userRouter from "./user.route";
import * as dotenv from "dotenv";

dotenv.config();

// rest of the code remains same
const app = express();
const PORT = process.env.SERVER_PORT;

app.use("/user", userRouter);

const url = process.env.DB_URL as string;
const connectionOptions: ConnectOptions = {};
connect(url, connectionOptions)
  .then(() => console.log("[server]: Connected to database"))
  .catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log(`[server]: Server is running at https://localhost:${PORT}`);
});
