import express from "express";
import { connect, ConnectOptions } from "mongoose";
import userRouter from "./user.route";

// rest of the code remains same
const app = express();
const PORT = 8000;

app.use(userRouter);

const url = "mongodb://localhost:27017/bosta";
const connectionOptions: ConnectOptions = {};
connect(url, connectionOptions)
  .then(() => console.log("[server]: Connected to database"))
  .catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log(`[server]: Server is running at https://localhost:${PORT}`);
});
