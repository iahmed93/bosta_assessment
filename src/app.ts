import express from "express";
import { connect, ConnectOptions } from "mongoose";
import * as dotenv from "dotenv";
import morgan from "morgan";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import fs from "fs";

import { userRouter } from "./routes/user.route";
import { auth } from "./middlewares/auth";
import { checkRouter } from "./routes/check.route";
import { startActiveChecks } from "./services/check.service";

dotenv.config();

const PORT = process.env.PORT || 8000;

const swaggerData = fs.readFileSync("src/assets/swagger.json", "utf-8");

const app = express();

app.use("/api/docs", swaggerUI.serve, swaggerUI.setup(JSON.parse(swaggerData)));

app.use(express.json());
app.use(morgan("combined"));
app.use("/api/user", userRouter);
app.use(auth);
app.use("/api/check", checkRouter);

const url = process.env.DB_URL as string;
const connectionOptions: ConnectOptions = {};
connect(url, connectionOptions)
  .then(() => {
    console.log("Connected to database");
    console.log(`starting all active checks`);
    startActiveChecks();
  })
  .catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log(`Server is running at localhost:${PORT}`);
});
