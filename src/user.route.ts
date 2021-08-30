import { Router } from "express";

const userRouter = Router();

userRouter.put("/signup", (req, res) => {
  return res.send("Post Sign Up");
});

userRouter.post("/signin", (req, res) => {
  return res.send("Post Sign IN");
});

userRouter.post("/verify", (req, res) => {
  return res.send("Post Sign IN");
});

export = userRouter;
