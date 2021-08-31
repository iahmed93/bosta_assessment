import { Router } from "express";

const checkRouter = Router();

checkRouter.put("/", async (req, res) => {
  res.send("PUT /check");
});

export = checkRouter;
