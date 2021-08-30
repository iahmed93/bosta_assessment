import { Router } from "express";

const userRouter = Router();

userRouter.post("/signup", (req, res) => {
  return res.send("Post SignUp");
});

export = userRouter;
